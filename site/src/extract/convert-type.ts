import {
  ts,
  Type,
  ParameterDeclaration,
  PropertySignature,
  MethodSignature,
  PropertyAssignment,
  ShorthandPropertyAssignment,
  MethodDeclaration,
} from "ts-morph";
import { collectSymbol } from ".";
import { assert } from "../lib/assert";
import {
  SerializedType,
  ObjectMember,
  TypeKind,
  TupleElementKind,
  ObjectMemberKind,
  KnownIntrinsic,
} from "../lib/types";
import { convertTypeNode } from "./convert-node";
import {
  getDocs,
  getParameters,
  getTypeParameters,
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
    const intrinsic = (type.compilerType as any).intrinsicName;
    return {
      kind: TypeKind.Intrinsic,
      value: KnownIntrinsic[intrinsic] || intrinsic,
    };
  }

  if (type.isArray()) {
    return {
      kind: TypeKind.Array,
      readonly: false,
      inner: convertType(type.getArrayElementTypeOrThrow()),
    };
  }
  let symbol = type.getSymbol();
  if (symbol) {
    if (symbol.getName() === "ReadonlyArray") {
      return {
        kind: TypeKind.Array,
        readonly: true,
        inner: convertType(type.getTypeArguments()[0]),
      };
    }
    if (type.isTypeParameter()) {
      return { kind: TypeKind.TypeParameter, name: symbol.getName() };
    }
    const name = symbol.getName();
    if (name !== "__type" && name !== "__function" && name !== "__object") {
      symbol = symbol.getAliasedSymbol() || symbol;
      collectSymbol(symbol);
      return {
        kind: TypeKind.Reference,
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
      kind: TypeKind.Reference,
      fullName: getSymbolIdentifier(aliasSymbol),
      name: aliasSymbol.getName(),
      typeArguments: type.getTypeArguments().map((x) => convertType(x)),
    };
  }

  const literalValue = type.getLiteralValue();

  if (literalValue !== undefined) {
    if (typeof literalValue === "string") {
      return { kind: TypeKind.StringLiteral, value: literalValue };
    }
    if (typeof literalValue === "number") {
      return { kind: TypeKind.NumericLiteral, value: literalValue };
    }
    return {
      kind: TypeKind.BigIntLiteral,
      value:
        (literalValue.negative ? "-" : "") + literalValue.base10Value + "n",
    };
  }

  if (type.isTuple()) {
    const elements = type.getTupleElements();
    const tupleType = (type.compilerType as ts.TupleTypeReference).target;

    return {
      kind: TypeKind.Tuple,
      readonly: tupleType.readonly,
      elements: tupleType.elementFlags.map((flag, i) => {
        const type = convertType(elements[i]);
        let kind: TupleElementKind | undefined = undefined;
        if (flag & ts.ElementFlags.Optional) {
          kind = TupleElementKind.Optional;
        }
        if (flag & ts.ElementFlags.Required) {
          kind = TupleElementKind.Required;
        }
        if (flag & ts.ElementFlags.Variable) {
          kind = TupleElementKind.Variadic;
        }
        if (flag & ts.ElementFlags.Rest) {
          kind = TupleElementKind.Rest;
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
      kind: TypeKind.Conditional,
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
      kind: TypeKind.IndexedAccess,
      object,
      index,
    };
  }

  if (type.isUnion()) {
    return {
      kind: TypeKind.Union,
      types: type.getUnionTypes().map((x) => convertType(x)),
    };
  }

  if (type.isIntersection()) {
    return {
      kind: TypeKind.Intersection,
      types: type.getIntersectionTypes().map((x) => convertType(x)),
    };
  }

  if (type.isClass()) {
    return { kind: TypeKind.Intrinsic, value: "class" };
  }

  const callSignatures = type.getCallSignatures();

  if (callSignatures.length) {
    const signature = callSignatures[0];

    return {
      kind: TypeKind.Signature,
      docs: "",
      parameters: signature.getParameters().map((param) => {
        let decl = param.getValueDeclarationOrThrow() as ParameterDeclaration;
        const typeNode = decl.getTypeNode();
        return {
          name: param.getName(),
          type: typeNode
            ? convertTypeNode(typeNode)
            : convertType(decl.getType()),
          optional: decl.hasQuestionToken(),
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
          if (isOptional && type.kind === TypeKind.Union) {
            type = {
              kind: TypeKind.Union,
              types: type.types.filter(
                (x) => x.kind !== TypeKind.Intrinsic || x.value !== "undefined"
              ),
            };
            if (type.types.length === 1) {
              type = type.types[0];
            }
          }
          return {
            kind: ObjectMemberKind.Prop,
            docs: getDocs(decl),
            name: prop.getName(),
            readonly: decl.isReadonly(),
            optional: isOptional,
            type,
          };
        }

        if (
          decl instanceof MethodSignature ||
          decl instanceof MethodDeclaration
        ) {
          return {
            kind: ObjectMemberKind.Method,
            name: prop.getName(),
            optional: decl.hasQuestionToken(),
            parameters: getParameters(decl),
            docs: getDocs(decl),
            typeParams: getTypeParameters(decl),
            returnType: convertType(decl.getReturnType()),
          };
        }
        if (
          decl instanceof PropertyAssignment ||
          decl instanceof ShorthandPropertyAssignment
        ) {
          let type = convertType(decl.getType());
          const isOptional = decl.hasQuestionToken();
          if (isOptional && type.kind === TypeKind.Union) {
            type = {
              kind: TypeKind.Union,
              types: type.types.filter(
                (x) => x.kind !== TypeKind.Intrinsic || x.value !== "undefined"
              ),
            };
            if (type.types.length === 1) {
              type = type.types[0];
            }
          }
          return {
            kind: ObjectMemberKind.Prop,
            name: prop.getName(),
            docs: "",
            readonly: false,
            optional: isOptional,
            type,
          };
        }
        debugger;
        return { kind: ObjectMemberKind.Unknown, content: decl.getText() };
      });
    const stringIndexType = type.getStringIndexType();
    const numberIndexType = type.getNumberIndexType();
    if (stringIndexType) {
      members.push({
        kind: ObjectMemberKind.Index,
        key: { kind: TypeKind.Intrinsic, value: KnownIntrinsic.string },
        value: convertType(stringIndexType),
      });
    }
    if (numberIndexType) {
      members.push({
        kind: ObjectMemberKind.Index,
        key: { kind: TypeKind.Intrinsic, value: KnownIntrinsic.number },
        value: convertType(numberIndexType),
      });
    }
    return {
      kind: TypeKind.Object,
      members,
    };
  }

  return { kind: TypeKind.Raw, value: type.getText() };
}
