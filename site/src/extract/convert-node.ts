import {
  TypeNode,
  Node,
  ts,
  EntityName,
  CompilerNodeToWrappedType,
  TypeParameterDeclaration,
} from "ts-morph";
import {
  getParameters,
  getTypeParameters,
  getSymbolIdentifier,
  getObjectMembers,
} from "./utils";
import { _convertType } from "./convert-type";
import { collectSymbol } from ".";
import { fakeAssert, assert, assertNever } from "../lib/assert";
import {
  KnownIntrinsic,
  SerializedType,
  TupleElement,
  TupleElementKind,
  TypeKind,
} from "../lib/types";

function wrapInTsMorphNode<LocalCompilerNodeType extends ts.Node = ts.Node>(
  someNode: Node,
  compilerNode: LocalCompilerNodeType
): CompilerNodeToWrappedType<LocalCompilerNodeType> {
  return (someNode as any)._getNodeFromCompilerNode(compilerNode);
}

function handleReference(
  typeArguments: TypeNode[],
  typeName: EntityName
): SerializedType {
  let symbol = typeName.getSymbol();
  if (!symbol) {
    return {
      kind: TypeKind.Reference,
      fullName: "unknown",
      name: typeName.getText(),
      typeArguments: typeArguments.map((x) => convertTypeNode(x)),
    };
  }

  if (symbol.getDeclarations()?.[0] instanceof TypeParameterDeclaration) {
    return {
      kind: TypeKind.TypeParameter,
      name: symbol.getName(),
    };
  }

  if (
    symbol.getName() === "Array" &&
    symbol.getFullyQualifiedName() === "Array"
  ) {
    return {
      kind: TypeKind.Array,
      readonly: false,
      inner: convertTypeNode(typeArguments[0]),
    };
  }
  if (
    symbol.getName() === "ReadonlyArray" &&
    symbol.getFullyQualifiedName() === "ReadonlyArray"
  ) {
    return {
      kind: TypeKind.Array,
      readonly: true,
      inner: convertTypeNode(typeArguments[0]),
    };
  }
  symbol = symbol.getAliasedSymbol() || symbol;
  collectSymbol(symbol);
  const fullName = getSymbolIdentifier(symbol);
  let name = symbol.getName();
  if (fullName === "unknown") {
    name = typeName.getText();
  }

  return {
    kind: TypeKind.Reference,
    fullName,
    name,
    typeArguments: typeArguments.map((x) => convertTypeNode(x)),
  };
}

export function convertTypeNode(node: TypeNode): SerializedType {
  if (TypeNode.isTypeReferenceNode(node)) {
    return handleReference(node.getTypeArguments(), node.getTypeName());
  }
  if (TypeNode.isExpressionWithTypeArguments(node)) {
    return handleReference(
      node.getTypeArguments(),
      node.getExpression() as EntityName
    );
  }

  if (TypeNode.isAnyKeyword(node)) {
    return { kind: TypeKind.Intrinsic, value: KnownIntrinsic.any };
  }
  if (TypeNode.isUndefinedKeyword(node)) {
    return { kind: TypeKind.Intrinsic, value: KnownIntrinsic.undefined };
  }
  if (TypeNode.isNeverKeyword(node)) {
    return { kind: TypeKind.Intrinsic, value: KnownIntrinsic.never };
  }
  if (TypeNode.isBooleanKeyword(node)) {
    return { kind: TypeKind.Intrinsic, value: KnownIntrinsic.boolean };
  }
  if (TypeNode.isObjectKeyword(node)) {
    return { kind: TypeKind.Intrinsic, value: KnownIntrinsic.object };
  }
  if (TypeNode.isStringKeyword(node)) {
    return { kind: TypeKind.Intrinsic, value: KnownIntrinsic.string };
  }
  if (TypeNode.isNumberKeyword(node)) {
    return { kind: TypeKind.Intrinsic, value: KnownIntrinsic.number };
  }
  if (TypeNode.is(ts.SyntaxKind.VoidKeyword)(node as any)) {
    return { kind: TypeKind.Intrinsic, value: KnownIntrinsic.void };
  }
  if (TypeNode.is(ts.SyntaxKind.UnknownKeyword)(node as any)) {
    return { kind: TypeKind.Intrinsic, value: KnownIntrinsic.unknown };
  }

  if (TypeNode.isLiteralTypeNode(node)) {
    const literal = node.getLiteral();
    if (TypeNode.isNullLiteral(literal)) {
      return { kind: TypeKind.Intrinsic, value: KnownIntrinsic.null };
    }
    if (TypeNode.isStringLiteral(literal)) {
      const value = literal.getLiteralValue();
      return { kind: TypeKind.StringLiteral, value };
    }
    if (TypeNode.isNumericLiteral(literal)) {
      const value = literal.getLiteralValue();
      return { kind: TypeKind.NumericLiteral, value };
    }
    if (TypeNode.isBigIntLiteral(literal)) {
      return { kind: TypeKind.BigIntLiteral, value: literal.getText() };
    }
    if (TypeNode.isTrueLiteral(literal)) {
      return { kind: TypeKind.Intrinsic, value: KnownIntrinsic.true };
    }
    if (TypeNode.isFalseLiteral(literal)) {
      return { kind: TypeKind.Intrinsic, value: KnownIntrinsic.false };
    }
  }
  if (TypeNode.isUnionTypeNode(node)) {
    return {
      kind: TypeKind.Union,
      types: node.getTypeNodes().map((x) => convertTypeNode(x)),
    };
  }
  if (TypeNode.isIndexedAccessTypeNode(node)) {
    return {
      kind: TypeKind.IndexedAccess,
      object: convertTypeNode(node.getObjectTypeNode()),
      index: convertTypeNode(node.getIndexTypeNode()),
    };
  }
  if (TypeNode.isConditionalTypeNode(node)) {
    return {
      kind: TypeKind.Conditional,
      checkType: convertTypeNode(node.getCheckType()),
      extendsType: convertTypeNode(node.getExtendsType()),
      trueType: convertTypeNode(node.getTrueType()),
      falseType: convertTypeNode(node.getFalseType()),
    };
  }
  if (TypeNode.isParenthesizedTypeNode(node)) {
    return { kind: TypeKind.Paren, value: convertTypeNode(node.getTypeNode()) };
  }

  if (TypeNode.isInferTypeNode(node)) {
    return { kind: TypeKind.Infer, name: node.getTypeParameter().getName() };
  }
  if (TypeNode.isIntersectionTypeNode(node)) {
    return {
      kind: TypeKind.Intersection,
      types: node.getTypeNodes().map((x) => convertTypeNode(x)),
    };
  }
  if (TypeNode.isMappedTypeNode(node)) {
    const typeParam = node.getTypeParameter();
    const constraint = typeParam.getConstraintOrThrow();

    return {
      kind: TypeKind.Mapped,
      param: {
        name: typeParam.getName(),
        constraint: convertTypeNode(constraint),
      },
      type: convertTypeNode(node.getTypeNodeOrThrow()),
    };
  }
  if (TypeNode.isTypeLiteralNode(node)) {
    return {
      kind: TypeKind.Object,
      members: getObjectMembers(node),
    };
  }

  if (TypeNode.isFunctionTypeNode(node)) {
    const returnTypeNode = node.getReturnTypeNode();
    return {
      kind: TypeKind.Signature,
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
      kind: TypeKind.Array,
      readonly: false,
      inner: convertTypeNode(node.getElementTypeNode()),
    };
  }

  if (TypeNode.isTupleTypeNode(node)) {
    return {
      kind: TypeKind.Tuple,
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
            kind: TupleElementKind.Optional,
            label,
            type: convertTypeNode(element.getNodeProperty("type")),
          };
        }

        if (element.compilerNode.kind === ts.SyntaxKind.RestType) {
          fakeAssert<TypeNode<ts.RestTypeNode>>(element);
          return {
            kind: TupleElementKind.Variadic,
            label,
            type: convertTypeNode(element.getNodeProperty("type")),
          };
        }
        return {
          kind: TupleElementKind.Required,
          label,
          type: convertTypeNode(element),
        };
      }),
    };
  }

  if (node.compilerNode.kind === ts.SyntaxKind.TypeOperator) {
    fakeAssert<TypeNode<ts.TypeOperatorNode>>(node);
    if (node.compilerNode.operator === ts.SyntaxKind.UniqueKeyword) {
      return { kind: TypeKind.Intrinsic, value: "unique symbol" };
    }
    if (node.compilerNode.operator === ts.SyntaxKind.ReadonlyKeyword) {
      const inner = convertTypeNode(node.getNodeProperty("type"));
      if (inner.kind === TypeKind.Array || inner.kind === TypeKind.Tuple) {
        return {
          ...inner,
          readonly: true,
        };
      }
      assert(
        false,
        `non-array thing with readonly keyword with kind: ${inner.kind}`
      );
    }
    if (node.compilerNode.operator === ts.SyntaxKind.KeyOfKeyword) {
      return {
        kind: TypeKind.Keyof,
        value: convertTypeNode(node.getNodeProperty("type")),
      };
    }
    assertNever(node.compilerNode.operator);
  }

  if (TypeNode.isImportTypeNode(node)) {
    let qualifier = node.getQualifier();
    if (qualifier) {
      return handleReference(node.getTypeArguments(), qualifier);
    }
    return _convertType(node.getType(), 0);
  }

  if (node.compilerNode.kind === ts.SyntaxKind.TypeQuery) {
    fakeAssert<TypeNode<ts.TypeQueryNode>>(node);
    const entityName = wrapInTsMorphNode(node, node.compilerNode.exprName);
    let symbol = entityName.getSymbol();
    if (symbol) {
      symbol = symbol.getAliasedSymbol() || symbol;

      return {
        kind: TypeKind.Typeof,
        fullName: getSymbolIdentifier(symbol),
        name: symbol.getName(),
      };
    }
  }

  if (TypeNode.isTypePredicateNode(node)) {
    const typeNode = node.getTypeNode();
    const type = typeNode ? convertTypeNode(typeNode) : typeNode;
    return {
      kind: TypeKind.TypePredicate,
      asserts: node.hasAssertsModifier(),
      param: node.getParameterNameNode().getText(),
      ...(type ? { type } : {}),
    };
  }

  if (TypeNode.isThisTypeNode(node)) {
    return { kind: TypeKind.Intrinsic, value: KnownIntrinsic.this };
  }
  return {
    kind: TypeKind.Raw,
    value: node.getText(),
    tsKind: node.getKindName(),
  };
}
