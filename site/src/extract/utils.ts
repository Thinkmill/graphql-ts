import {
  JSDocableNode,
  TypeParameteredNode,
  ParameteredNode,
  JSDoc,
  ts,
  Symbol,
  TypeElementMemberedNode,
  Node,
} from "ts-morph";
import { convertTypeNode } from "./convert-node";
import { _convertType } from "./convert-type";
import hashString from "@emotion/hash";

export type TypeParam = {
  name: string;
  constraint: SerializedType | null;
  default: SerializedType | null;
};

export type SerializedSymbol =
  | {
      kind: "function";
      name: string;
      parameters: { name: string; type: SerializedType }[];
      docs: string;
      typeParams: TypeParam[];
      returnType: SerializedType;
    }
  | {
      kind: "module";
      name: string;
      exports: Record<string, string>;
      docs: string;
    }
  | {
      kind: "variable";
      name: string;
      docs: string;
      variableKind: "var" | "let" | "const";
      type: SerializedType;
    }
  | {
      kind: "type-alias";
      name: string;
      docs: string;
      typeParams: TypeParam[];
      type: SerializedType;
    }
  | {
      kind: "unknown";
      name: string;
      docs: string;
      content: string;
    }
  | {
      kind: "interface";
      name: string;
      docs: string;
      typeParams: TypeParam[];
      extends: SerializedType[];
      members: ObjectMember[];
    };

export type TupleElement = {
  label: string | null;
  kind: "optional" | "required" | "rest" | "variadic";
  type: SerializedType;
};

export type ObjectMember =
  | { kind: "index"; key: SerializedType; value: SerializedType }
  | {
      kind: "prop";
      name: string;
      docs: string;
      optional: boolean;
      readonly: boolean;
      type: SerializedType;
    }
  | {
      kind: "method";
      name: string;
      optional: boolean;
      parameters: { name: string; type: SerializedType }[];
      docs: string;
      typeParams: TypeParam[];
      returnType: SerializedType;
    }
  | {
      kind: "unknown";
      content: string;
    };

export type SerializedType =
  | { kind: "intrinsic"; value: string }
  | {
      kind: "reference";
      fullName: string;
      name: string;
      typeArguments: SerializedType[];
    }
  | { kind: "array"; readonly: boolean; inner: SerializedType }
  | { kind: "type-parameter"; name: string }
  | { kind: "union"; types: SerializedType[] }
  | { kind: "intersection"; types: SerializedType[] }
  | { kind: "infer"; name: string }
  | { kind: "paren"; value: SerializedType }
  | { kind: "tuple"; readonly: boolean; elements: TupleElement[] }
  | { kind: "object"; members: ObjectMember[] }
  | { kind: "indexed-access"; object: SerializedType; index: SerializedType }
  | {
      kind: "conditional";
      checkType: SerializedType;
      extendsType: SerializedType;
      trueType: SerializedType;
      falseType: SerializedType;
    }
  | { kind: "string-literal"; value: string }
  | { kind: "numeric-literal"; value: number }
  | { kind: "bigint-literal"; value: string }
  | { kind: "keyof"; value: SerializedType }
  | {
      kind: "mapped";
      param: { name: string; constraint: SerializedType };
      type: SerializedType;
    }
  | {
      kind: "signature";
      parameters: { name: string; type: SerializedType }[];
      docs: string;
      typeParams: TypeParam[];
      returnType: SerializedType;
    }
  | { kind: "raw"; value: string };

export function getTypeParameters(node: TypeParameteredNode): TypeParam[] {
  return node.getTypeParameters().map((typeParam) => {
    const constraint = typeParam.getConstraint();
    const defaultType = typeParam.getDefault();
    return {
      name: typeParam.getName(),
      constraint: constraint ? convertTypeNode(constraint) : null,
      default: defaultType ? convertTypeNode(defaultType) : null,
    };
  });
}

export function getObjectMembers(
  node: TypeElementMemberedNode
): ObjectMember[] {
  return node.getMembers().map((member) => {
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
        docs: getDocs(member),
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
  });
}

export function getParameters(node: ParameteredNode) {
  return node.getParameters().map((x) => {
    const typeNode = x.getTypeNode();
    return {
      name: x.getName(),
      type: typeNode ? convertTypeNode(typeNode) : _convertType(x.getType(), 0),
    };
  });
}

export function getDocsFromJSDocNodes(nodes: JSDoc[]) {
  return nodes
    .map((x) => {
      const commentStuff = x.getComment() || [];
      if (typeof commentStuff === "string") {
        return commentStuff;
      }
      return commentStuff
        .map((x) => {
          if (x === undefined) {
            throw new Error("undefined!");
          }

          if (ts.isJSDocLink(x.compilerNode)) {
            if (x.getSymbol()) {
              const symbol = x.getSymbolOrThrow();
              const finalSymbol = symbol.getAliasedSymbol() || symbol;
              return {
                kind: "link" as const,
                content: x.compilerNode.text,
                name: finalSymbol.getName(),
                fullName: getSymbolIdentifier(finalSymbol),
              };
            } else {
              console.log(
                "could not get symbol for link with text at:",
                x.getFullText(),
                x.compilerNode.getSourceFile().fileName
              );
            }
          }

          return { kind: "text" as const, content: x.compilerNode.text };
        })
        .map((x) => {
          if (x.kind === "text") {
            return x.content;
          }
          return `[${x.content || x.name}](#symbol-${x.fullName})`;
        })
        .join("");
    })
    .join("\n");
}

export function getDocs(decl: JSDocableNode) {
  return getDocsFromJSDocNodes(
    decl
      .getJsDocs()
      .filter((x) => x.getTags().every((x) => x.getTagName() !== "module"))
  );
}

export function fakeAssert<T>(val: any): asserts val is T {}

export function assertNever(arg: never): never {
  debugger;
  throw new Error(`unexpected call to assertNever: ${arg}`);
}

export function assert(
  condition: boolean,
  message = "failed assert"
): asserts condition {
  if (!condition) {
    debugger;
    throw new Error(message);
  }
}

export function getSymbolIdentifier(symbol: Symbol) {
  if (symbol.getFullyQualifiedName() === "unknown") {
    return "unknown";
  }
  const decls = symbol.getDeclarations();
  assert(decls.length >= 1, "expected exactly one declaration");

  return hashString(
    decls
      .map((decl) => {
        const filepath = decl.getSourceFile().getFilePath();
        return `${filepath}-${decl.getPos()}`;
      })
      .join("-")
  );
}
