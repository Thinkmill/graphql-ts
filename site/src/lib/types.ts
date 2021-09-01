export type TypeParam = {
  name: string;
  constraint: SerializedType | null;
  default: SerializedType | null;
};

export type Parameter = {
  name: string;
  type: SerializedType;
  optional: boolean;
};

// i'm not a fan of using TS enums
// but the strings take a sizable amount of space
// in the serialized thing and though they will compress really well
// Lambda has a hard limit of 5mb(or something around that)
// before compression so getting the size is imporant
// because pages are hitting that so getting

export enum SymbolKind {
  Function,
  Module,
  Variable,
  TypeAlias,
  Unknown,
  Interface,
  Class,
  Enum,
  EnumMember,
}

export type SerializedSymbol =
  | {
      kind: SymbolKind.Function;
      name: string;
      parameters: Parameter[];
      docs: string;
      typeParams: TypeParam[];
      returnType: SerializedType;
    }
  | {
      kind: SymbolKind.Module;
      name: string;
      exports: Record<string, string>;
      docs: string;
    }
  | {
      kind: SymbolKind.Variable;
      name: string;
      docs: string;
      variableKind: "var" | "let" | "const";
      type: SerializedType;
    }
  | {
      kind: SymbolKind.TypeAlias;
      name: string;
      docs: string;
      typeParams: TypeParam[];
      type: SerializedType;
    }
  | {
      kind: SymbolKind.Unknown;
      name: string;
      docs: string;
      content: string;
    }
  | {
      kind: SymbolKind.Interface;
      name: string;
      docs: string;
      typeParams: TypeParam[];
      extends: SerializedType[];
      members: ObjectMember[];
    }
  | {
      kind: SymbolKind.Class;
      name: string;
      docs: string;
      hasPrivateMembers: boolean;
      typeParams: TypeParam[];
      extends: SerializedType | null;
      implements: SerializedType[];
      constructors: {
        parameters: Parameter[];
        docs: string;
        typeParams: TypeParam[];
      }[];
      members: ClassMember[];
    }
  | {
      kind: SymbolKind.Enum;
      const: boolean;
      name: string;
      docs: string;
      members: string[];
    }
  | {
      kind: SymbolKind.EnumMember;
      name: string;
      docs: string;
      value: string | number | null;
    };

export enum ClassMemberKind {
  Index,
  Prop,
  Method,
  Unknown,
}

export type ClassMember =
  | {
      kind: ClassMemberKind.Index;
      static: boolean;
      key: SerializedType;
      value: SerializedType;
    }
  | {
      kind: ClassMemberKind.Prop;
      static: boolean;
      name: string;
      docs: string;
      optional: boolean;
      readonly: boolean;
      type: SerializedType;
    }
  | {
      kind: ClassMemberKind.Method;
      static: boolean;
      name: string;
      optional: boolean;
      parameters: Parameter[];
      docs: string;
      typeParams: TypeParam[];
      returnType: SerializedType;
    }
  | {
      kind: ClassMemberKind.Unknown;
      content: string;
    };

export enum TupleElementKind {
  Optional,
  Required,
  Rest,
  Variadic,
}

export type TupleElement = {
  label: string | null;
  kind: TupleElementKind;
  type: SerializedType;
};

export enum ObjectMemberKind {
  Index,
  Prop,
  Method,
  Unknown,
}

export type ObjectMember =
  | { kind: ObjectMemberKind.Index; key: SerializedType; value: SerializedType }
  | {
      kind: ObjectMemberKind.Prop;
      name: string;
      docs: string;
      optional: boolean;
      readonly: boolean;
      type: SerializedType;
    }
  | {
      kind: ObjectMemberKind.Method;
      name: string;
      optional: boolean;
      parameters: Parameter[];
      docs: string;
      typeParams: TypeParam[];
      returnType: SerializedType;
    }
  | {
      kind: ObjectMemberKind.Unknown;
      content: string;
    };

export enum TypeKind {
  Intrinsic,
  Reference,
  Typeof,
  Array,
  TypeParameter,
  Union,
  Intersection,
  Infer,
  Paren,
  Tuple,
  Object,
  IndexedAccess,
  Conditional,
  StringLiteral,
  NumericLiteral,
  BigIntLiteral,
  Keyof,
  Mapped,
  Signature,
  TypePredicate,
  Raw,
}

export enum KnownIntrinsic {
  any,
  undefined,
  never,
  boolean,
  object,
  string,
  number,
  void,
  unknown,
  null,
  true,
  false,
  this,
}

export type SerializedType =
  | { kind: TypeKind.Intrinsic; value: KnownIntrinsic | string }
  | {
      kind: TypeKind.Reference;
      fullName: string;
      name: string;
      typeArguments: SerializedType[];
    }
  | {
      kind: TypeKind.Typeof;
      fullName: string;
      name: string;
    }
  | { kind: TypeKind.Array; readonly: boolean; inner: SerializedType }
  | { kind: TypeKind.TypeParameter; name: string }
  | { kind: TypeKind.Union; types: SerializedType[] }
  | { kind: TypeKind.Intersection; types: SerializedType[] }
  | { kind: TypeKind.Infer; name: string }
  | { kind: TypeKind.Paren; value: SerializedType }
  | { kind: TypeKind.Tuple; readonly: boolean; elements: TupleElement[] }
  | { kind: TypeKind.Object; members: ObjectMember[] }
  | {
      kind: TypeKind.IndexedAccess;
      object: SerializedType;
      index: SerializedType;
    }
  | {
      kind: TypeKind.Conditional;
      checkType: SerializedType;
      extendsType: SerializedType;
      trueType: SerializedType;
      falseType: SerializedType;
    }
  | { kind: TypeKind.StringLiteral; value: string }
  | { kind: TypeKind.NumericLiteral; value: number }
  | { kind: TypeKind.BigIntLiteral; value: string }
  | { kind: TypeKind.Keyof; value: SerializedType }
  | {
      kind: TypeKind.Mapped;
      param: { name: string; constraint: SerializedType };
      type: SerializedType;
    }
  | {
      kind: TypeKind.Signature;
      parameters: Parameter[];
      docs: string;
      typeParams: TypeParam[];
      returnType: SerializedType;
    }
  | {
      kind: TypeKind.TypePredicate;
      asserts: boolean;
      param: string;
      /** This can be optional for `asserts condition` where `condition` is a param */
      type?: SerializedType;
    }
  | { kind: TypeKind.Raw; value: string; tsKind?: string };
