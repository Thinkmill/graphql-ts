import {
  ts,
  Type,
  ParameterDeclaration,
  PropertySignature,
  MethodSignature,
  PropertyAssignment,
} from "ts-morph";
import { collectSymbol } from ".";
import {
  assert,
  getDocs,
  getParameters,
  getTypeParameters,
  ObjectMember,
  TupleElement,
  SerializedType,
  getSymbolIdentifier,
} from "./utils";

function wrapInTsMorphType(someType: Type, compilerType: ts.Type) {
  return (someType as any)._context.compilerFactory.getType(compilerType);
}

export function _convertType(type: Type, depth: number): SerializedType {
  let convertType = (type: Type) => _convertType(type, depth + 1);
  if (type.compilerType.flags & ts.TypeFlags.Substitution) {
    return convertType(
      wrapInTsMorphType(
        type,
        (type.compilerType as ts.SubstitutionType).baseType
      )
    );
  }
  if (
    (type.compilerType as any).intrinsicName &&
    (type.compilerType as any).intrinsicName !== "error"
  ) {
    return {
      kind: "intrinsic",
      value: (type.compilerType as any).intrinsicName,
    };
  }

  if (type.isArray()) {
    return {
      kind: "array",
      readonly: false,
      inner: convertType(type.getArrayElementTypeOrThrow()),
    };
  }
  let symbol = type.getSymbol();
  if (symbol) {
    if (symbol.getName() === "ReadonlyArray") {
      return {
        kind: "array",
        readonly: true,
        inner: convertType(type.getTypeArguments()[0]),
      };
    }
    if (type.isTypeParameter()) {
      return { kind: "type-parameter", name: symbol.getName() };
    }
    const name = symbol.getName();
    if (name !== "__type" && name !== "__function" && name !== "__object") {
      symbol = symbol.getAliasedSymbol() || symbol;
      collectSymbol(symbol);
      return {
        kind: "reference",
        fullName: getSymbolIdentifier(symbol),
        name,
        typeArguments: (type as Type)
          .getTypeArguments()
          .map((x) => convertType(x)),
      };
    }
  }

  const aliasSymbol = type.getAliasSymbol();

  if (aliasSymbol) {
    collectSymbol(aliasSymbol);
    return {
      kind: "reference",
      fullName: getSymbolIdentifier(aliasSymbol),
      name: aliasSymbol.getName(),
      typeArguments: type.getTypeArguments().map((x) => convertType(x)),
    };
  }

  const literalValue = type.getLiteralValue();

  if (literalValue !== undefined) {
    if (typeof literalValue === "string") {
      return { kind: "string-literal", value: literalValue };
    }
    if (typeof literalValue === "number") {
      return { kind: "numeric-literal", value: literalValue };
    }
    return {
      kind: "bigint-literal",
      value:
        (literalValue.negative ? "-" : "") + literalValue.base10Value + "n",
    };
  }

  if (type.isTuple()) {
    const elements = type.getTupleElements();
    const tupleType = (type.compilerType as ts.TupleTypeReference).target;

    return {
      kind: "tuple",
      readonly: tupleType.readonly,
      elements: tupleType.elementFlags.map((flag, i) => {
        const type = convertType(elements[i]);
        let kind: TupleElement["kind"] | undefined = undefined;
        if (flag & ts.ElementFlags.Optional) {
          kind = "optional";
        }
        if (flag & ts.ElementFlags.Required) {
          kind = "required";
        }
        if (flag & ts.ElementFlags.Variable) {
          kind = "variadic";
        }
        if (flag & ts.ElementFlags.Rest) {
          kind = "rest";
        }
        assert(kind !== undefined);
        return {
          // TODO
          label: null,
          kind,
          type,
        };
      }),
    };
  }

  if (type.compilerType.flags & ts.TypeFlags.Conditional) {
    const conditionalType = type.compilerType as ts.ConditionalType;
    type.getText(undefined, ts.TypeFormatFlags.InTypeAlias);
    assert(
      conditionalType.resolvedTrueType !== undefined,
      "expected resolved true type"
    );
    assert(
      conditionalType.resolvedFalseType !== undefined,
      "expected resolved false type"
    );
    return {
      kind: "conditional",
      checkType: convertType(
        wrapInTsMorphType(type, conditionalType.checkType)
      ),
      extendsType: convertType(
        wrapInTsMorphType(type, conditionalType.extendsType)
      ),
      trueType: convertType(
        wrapInTsMorphType(type, conditionalType.resolvedTrueType)
      ),
      falseType: convertType(
        wrapInTsMorphType(type, conditionalType.resolvedFalseType)
      ),
    };
  }

  if (type.compilerType.flags & ts.TypeFlags.IndexedAccess) {
    const indexedAccessType = type.compilerType as ts.IndexedAccessType;

    const object = convertType(
      wrapInTsMorphType(type, indexedAccessType.objectType)
    );
    const index = convertType(
      wrapInTsMorphType(type, indexedAccessType.indexType)
    );
    return {
      kind: "indexed-access",
      object,
      index,
    };
  }

  if (type.isUnion()) {
    return {
      kind: "union",
      types: type.getUnionTypes().map((x) => convertType(x)),
    };
  }

  if (type.isIntersection()) {
    return {
      kind: "intersection",
      types: type.getIntersectionTypes().map((x) => convertType(x)),
    };
  }

  if (type.isClass()) {
    return { kind: "intrinsic", value: "class" };
  }

  const callSignatures = type.getCallSignatures();

  if (callSignatures.length) {
    const signature = callSignatures[0];

    return {
      kind: "signature",
      docs: "",
      parameters: signature.getParameters().map((param) => {
        let decl = param.getValueDeclarationOrThrow() as ParameterDeclaration;
        return {
          name: param.getName(),
          type: convertType(decl.getType()),
        };
      }),
      typeParams: signature.getTypeParameters().map((typeParam) => {
        const constraint = typeParam.getConstraint();
        const defaultType = typeParam.getDefault();
        return {
          name: typeParam.getSymbolOrThrow().getName(),
          constraint: constraint ? convertType(constraint) : null,
          default: defaultType ? convertType(defaultType) : null,
        };
      }),
      returnType: convertType(signature.getReturnType()),
    };
  }

  const objectFlags = type.getObjectFlags();

  if (objectFlags !== 0) {
    const members: ObjectMember[] = type
      .getProperties()
      .map((prop): ObjectMember => {
        const decl = prop.getDeclarations()[0];
        if (decl instanceof PropertySignature) {
          let type = convertType(decl.getType());
          const isOptional = decl.hasQuestionToken();
          if (isOptional && type.kind === "union") {
            type = {
              kind: "union",
              types: type.types.filter(
                (x) => x.kind !== "intrinsic" || x.value !== "undefined"
              ),
            };
            if (type.types.length === 1) {
              type = type.types[0];
            }
          }
          return {
            kind: "prop",
            docs: getDocs(decl),
            name: prop.getName(),
            readonly: decl.isReadonly(),
            optional: isOptional,
            type,
          };
        }
        if (decl instanceof MethodSignature) {
          return {
            kind: "method",
            name: prop.getName(),
            optional: decl.hasQuestionToken(),
            parameters: getParameters(decl),
            docs: getDocs(decl),
            typeParams: getTypeParameters(decl),
            returnType: convertType(decl.getReturnType()),
          };
        }
        if (decl instanceof PropertyAssignment) {
          let type = convertType(decl.getType());
          const isOptional = decl.hasQuestionToken();
          if (isOptional && type.kind === "union") {
            type = {
              kind: "union",
              types: type.types.filter(
                (x) => x.kind !== "intrinsic" || x.value !== "undefined"
              ),
            };
            if (type.types.length === 1) {
              type = type.types[0];
            }
          }
          return {
            kind: "prop",
            name: prop.getName(),
            docs: "",
            readonly: false,
            optional: isOptional,
            type,
          };
        }
        return { kind: "unknown", content: decl.getText() };
      });
    const stringIndexType = type.getStringIndexType();
    const numberIndexType = type.getNumberIndexType();
    if (stringIndexType) {
      members.push({
        kind: "index",
        key: { kind: "intrinsic", value: "string" },
        value: convertType(stringIndexType),
      });
    }
    if (numberIndexType) {
      members.push({
        kind: "index",
        key: { kind: "intrinsic", value: "number" },
        value: convertType(numberIndexType),
      });
    }
    return {
      kind: "object",
      members,
    };
  }

  return { kind: "raw", value: type.getText() };
}
