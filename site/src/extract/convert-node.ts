import { TypeNode, Type, Node, ts } from "ts-morph";
import {
  SerializedType,
  ObjectMember,
  getDocs,
  getParameters,
  getTypeParameters,
  TupleElement,
  fakeAssert,
  assertNever,
  getSymbolIdentifier,
} from "./utils";
import { _convertType } from "./convert-type";
import { collectSymbol } from ".";

export function convertTypeNode(node: TypeNode): SerializedType {
  if (TypeNode.isTypeReferenceNode(node)) {
    let symbol = node.getTypeName().getSymbolOrThrow();
    const _type = symbol.getDeclaredType();
    if (_type.isTypeParameter()) {
      return {
        kind: "type-parameter",
        name: symbol.getName(),
      };
    }

    const type = _type as Type;
    if (type.isArray()) {
      return {
        kind: "array",
        readonly: false,
        inner: convertTypeNode(node.getTypeArguments()[0]),
      };
    }
    if (symbol.getFullyQualifiedName() === "ReadonlyArray") {
      return {
        kind: "array",
        readonly: true,
        inner: convertTypeNode(node.getTypeArguments()[0]),
      };
    }
    symbol = symbol.getAliasedSymbol() || symbol;
    collectSymbol(symbol);

    return {
      kind: "reference",
      fullName: getSymbolIdentifier(symbol),
      name: symbol.getName(),
      typeArguments: node.getTypeArguments().map((x) => convertTypeNode(x)),
    };
  }
  if (TypeNode.isAnyKeyword(node)) {
    return { kind: "intrinsic", value: "any" };
  }
  if (TypeNode.isUndefinedKeyword(node)) {
    return { kind: "intrinsic", value: "undefined" };
  }
  if (TypeNode.isNeverKeyword(node)) {
    return { kind: "intrinsic", value: "never" };
  }
  if (TypeNode.isBooleanKeyword(node)) {
    return { kind: "intrinsic", value: "boolean" };
  }
  if (TypeNode.isObjectKeyword(node)) {
    return { kind: "intrinsic", value: "object" };
  }
  if (TypeNode.isStringKeyword(node)) {
    return { kind: "intrinsic", value: "string" };
  }
  if (TypeNode.isNumberKeyword(node)) {
    return { kind: "intrinsic", value: "number" };
  }
  if (TypeNode.is(ts.SyntaxKind.VoidKeyword)(node as any)) {
    return { kind: "intrinsic", value: "void" };
  }
  if (TypeNode.is(ts.SyntaxKind.UnknownKeyword)(node as any)) {
    return { kind: "intrinsic", value: "unknown" };
  }

  if (TypeNode.isLiteralTypeNode(node)) {
    const literal = node.getLiteral();
    if (TypeNode.isNullLiteral(literal)) {
      return { kind: "intrinsic", value: "null" };
    }
    if (TypeNode.isStringLiteral(literal)) {
      const value = literal.getLiteralValue();
      return { kind: "string-literal", value };
    }
    if (TypeNode.isNumericLiteral(literal)) {
      const value = literal.getLiteralValue();
      return { kind: "numeric-literal", value };
    }
    if (TypeNode.isBigIntLiteral(literal)) {
      return { kind: "bigint-literal", value: literal.getText() };
    }
    if (TypeNode.isTrueLiteral(literal)) {
      return { kind: "intrinsic", value: "true" };
    }
    if (TypeNode.isFalseLiteral(literal)) {
      return { kind: "intrinsic", value: "false" };
    }
  }
  if (TypeNode.isUnionTypeNode(node)) {
    return {
      kind: "union",
      types: node.getTypeNodes().map((x) => convertTypeNode(x)),
    };
  }
  if (TypeNode.isIndexedAccessTypeNode(node)) {
    return {
      kind: "indexed-access",
      object: convertTypeNode(node.getObjectTypeNode()),
      index: convertTypeNode(node.getIndexTypeNode()),
    };
  }
  if (TypeNode.isConditionalTypeNode(node)) {
    return {
      kind: "conditional",
      checkType: convertTypeNode(node.getCheckType()),
      extendsType: convertTypeNode(node.getExtendsType()),
      trueType: convertTypeNode(node.getTrueType()),
      falseType: convertTypeNode(node.getFalseType()),
    };
  }
  if (TypeNode.isParenthesizedTypeNode(node)) {
    return { kind: "paren", value: convertTypeNode(node.getTypeNode()) };
  }

  if (TypeNode.isInferTypeNode(node)) {
    return { kind: "infer", name: node.getTypeParameter().getName() };
  }
  if (TypeNode.isIntersectionTypeNode(node)) {
    return {
      kind: "intersection",
      types: node.getTypeNodes().map((x) => convertTypeNode(x)),
    };
  }
  if (TypeNode.isMappedTypeNode(node)) {
    const typeParam = node.getTypeParameter();
    const constraint = typeParam.getConstraintOrThrow();

    return {
      kind: "mapped",
      param: {
        name: typeParam.getName(),
        constraint: convertTypeNode(constraint),
      },
      type: convertTypeNode(node.getTypeNodeOrThrow()),
    };
  }
  if (TypeNode.isTypeLiteralNode(node)) {
    return {
      kind: "object",
      members: node.getMembers().flatMap((member): ObjectMember => {
        if (Node.isIndexSignatureDeclaration(member)) {
          member.getKeyTypeNode();
          return {
            kind: "index",
            key: convertTypeNode(member.getKeyTypeNode()),
            value: convertTypeNode(member.getReturnTypeNodeOrThrow()),
          };
        }
        if (Node.isPropertySignature(member)) {
          return {
            kind: "prop",
            name: member.getName(),
            optional: member.hasQuestionToken(),
            readonly: member.isReadonly(),
            type: convertTypeNode(member.getTypeNodeOrThrow()),
          };
        }
        if (Node.isMethodSignature(member)) {
          const returnTypeNode = member.getReturnTypeNode();
          return {
            kind: "method",
            name: member.getName(),
            optional: member.hasQuestionToken(),
            parameters: getParameters(member),
            typeParams: getTypeParameters(member),
            docs: getDocs(member),
            returnType: returnTypeNode
              ? convertTypeNode(returnTypeNode)
              : _convertType(member.getReturnType(), 0),
          };
        }
        if (Node.isCallSignatureDeclaration(member)) {
          const returnTypeNode = member.getReturnTypeNode();
          return {
            kind: "method",
            name: "",
            optional: false,
            parameters: getParameters(member),
            typeParams: getTypeParameters(member),
            docs: getDocs(member),
            returnType: returnTypeNode
              ? convertTypeNode(returnTypeNode)
              : _convertType(member.getReturnType(), 0),
          };
        }
        throw new Error("unhandled object member");
      }),
    };
  }

  if (TypeNode.isFunctionTypeNode(node)) {
    const returnTypeNode = node.getReturnTypeNode();
    return {
      kind: "signature",
      parameters: getParameters(node),
      docs: "",
      typeParams: getTypeParameters(node),
      returnType: returnTypeNode
        ? convertTypeNode(returnTypeNode)
        : _convertType(node.getReturnType(), 0),
    };
  }

  if (TypeNode.isArrayTypeNode(node)) {
    return {
      kind: "array",
      readonly: false,
      inner: convertTypeNode(node.getElementTypeNode()),
    };
  }

  if (TypeNode.isTupleTypeNode(node)) {
    return {
      kind: "tuple",
      readonly: false,
      elements: node.getElements().map((element): TupleElement => {
        let label: string | null = null;
        if (TypeNode.isNamedTupleMember(element)) {
          label = element.getName();
          element = element.getTypeNode();
        }

        if (element.compilerNode.kind === ts.SyntaxKind.OptionalType) {
          fakeAssert<Node<ts.OptionalTypeNode>>(element);
          return {
            kind: "optional",
            label,
            type: convertTypeNode(element.getNodeProperty("type")),
          };
        }

        if (element.compilerNode.kind === ts.SyntaxKind.RestType) {
          fakeAssert<TypeNode<ts.RestTypeNode>>(element);
          return {
            kind: "variadic",
            label,
            type: convertTypeNode(element.getNodeProperty("type")),
          };
        }
        return {
          kind: "required",
          label,
          type: convertTypeNode(element),
        };
      }),
    };
  }

  if (node.compilerNode.kind === ts.SyntaxKind.TypeOperator) {
    fakeAssert<TypeNode<ts.TypeOperatorNode>>(node);
    if (node.compilerNode.operator === ts.SyntaxKind.UniqueKeyword) {
      return { kind: "intrinsic", value: "unique symbol" };
    }
    if (node.compilerNode.operator === ts.SyntaxKind.ReadonlyKeyword) {
      const inner = convertTypeNode(node.getNodeProperty("type"));
      if (inner.kind === "array" || inner.kind === "tuple") {
        return {
          ...inner,
          readonly: true,
        };
      }
      console.log(
        "non-array thing with readonly keyword with kind:",
        inner.kind
      );
      return inner;
    }
    if (node.compilerNode.operator === ts.SyntaxKind.KeyOfKeyword) {
      return {
        kind: "keyof",
        value: convertTypeNode(node.getNodeProperty("type")),
      };
    }
    assertNever(node.compilerNode.operator);
  }

  return { kind: "raw", value: node.getText() };
}
