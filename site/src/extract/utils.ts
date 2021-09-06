import {
  JSDocableNode,
  TypeParameteredNode,
  ParameteredNode,
  JSDoc,
  ts,
  Symbol,
  TypeElementMemberedNode,
  Node,
  Project,
} from "ts-morph";
import semver from "semver";
import path from "path";
import { convertTypeNode } from "./convert-node";
import { _convertType } from "./convert-type";
import hashString from "@emotion/hash";
import { assert, assertNever } from "../lib/assert";
import { DocInfo } from ".";
import {
  TypeParam,
  ObjectMember,
  Parameter,
  SerializedSymbol,
} from "../lib/types";
import { PackageMetadata } from "./fetch-package-metadata";

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
  return node.getMembers().map((member): ObjectMember => {
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
        kind: "call",
        parameters: getParameters(member),
        typeParams: getTypeParameters(member),
        docs: getDocs(member),
        returnType: returnTypeNode
          ? convertTypeNode(returnTypeNode)
          : _convertType(member.getReturnType(), 0),
      };
    }
    if (Node.isConstructSignatureDeclaration(member)) {
      const returnTypeNode = member.getReturnTypeNode();
      return {
        kind: "constructor",
        parameters: getParameters(member),
        typeParams: getTypeParameters(member),
        docs: getDocs(member),
        returnType: returnTypeNode
          ? convertTypeNode(returnTypeNode)
          : _convertType(member.getReturnType(), 0),
      };
    }
    assertNever(member);
  });
}

export function getParameters(node: ParameteredNode): Parameter[] {
  return node.getParameters().map((x): Parameter => {
    const typeNode = x.getTypeNode();
    return {
      name: x.getName(),
      type: typeNode ? convertTypeNode(typeNode) : _convertType(x.getType(), 0),
      kind: x.isRestParameter()
        ? "rest"
        : x.isOptional()
        ? "optional"
        : "normal",
    };
  });
}

export function getDocsFromJSDocNodes(nodes: JSDoc[]) {
  return nodes
    .map((x) => {
      let fromTags = x
        .getTags()
        .filter((x) => x.getTagName() !== "module")
        .map((x) => {
          return `${x.getTagName()}: ${x.getCommentText()}`;
        })
        .join("\n\n");
      if (fromTags) {
        fromTags = `\n\n${fromTags}`;
      }
      const commentStuff = x.getComment() || [];
      if (typeof commentStuff === "string") {
        return commentStuff + fromTags;
      }

      return (
        commentStuff
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
          .join("") + fromTags
      );
    })
    .join("\n\n");
}

export function getDocs(decl: JSDocableNode) {
  return getDocsFromJSDocNodes(
    decl
      .getJsDocs()
      .filter((x) => x.getTags().every((x) => x.getTagName() !== "module"))
  );
}

export function getSymbolIdentifier(symbol: Symbol) {
  const decls = symbol.getDeclarations();
  if (decls.length === 0) {
    const fullName = symbol.getFullyQualifiedName();
    if (fullName === "unknown" || fullName === "globalThis") {
      return fullName;
    }
    assert(decls.length >= 1, "expected exactly at least one declaration");
  }

  return hashString(
    decls
      .map((decl) => {
        const filepath = decl.getSourceFile().getFilePath();
        return `${decl.getKindName()}-${filepath}-${decl.getPos()}-${decl.getEnd()}`;
      })
      .join("-")
  );
}

export function getSymbolsForInnerBitsAndGoodIdentifiers(
  accessibleSymbols: Record<string, SerializedSymbol>,
  packageName: string,
  canonicalExportLocations: DocInfo["canonicalExportLocations"],
  symbolReferences: Record<string, string[]>,
  _rootSymbols: string[]
) {
  const rootSymbols = new Set(_rootSymbols);
  const unexportedToExportedRef = new Map<string, string>();
  const unexportedToUnexportedRef = new Map<string, string>();

  for (const [symbolFullName, symbols] of Object.entries(symbolReferences)) {
    if (
      !canonicalExportLocations[symbolFullName] &&
      accessibleSymbols[symbolFullName] &&
      accessibleSymbols[symbolFullName].kind !== "enum-member"
    ) {
      const firstExportedSymbol = symbols.find(
        (x) => canonicalExportLocations[x] !== undefined
      );
      if (firstExportedSymbol) {
        unexportedToExportedRef.set(symbolFullName, firstExportedSymbol);
      } else {
        unexportedToUnexportedRef.set(symbolFullName, symbols[0]);
      }
    }
  }

  while (unexportedToUnexportedRef.size) {
    for (const [
      unexportedSymbol,
      unexportedReferencedLocation,
    ] of unexportedToUnexportedRef) {
      if (unexportedToExportedRef.has(unexportedReferencedLocation)) {
        unexportedToUnexportedRef.delete(unexportedSymbol);
        unexportedToExportedRef.set(
          unexportedSymbol,
          unexportedToExportedRef.get(unexportedReferencedLocation)!
        );
      }
      if (unexportedToUnexportedRef.has(unexportedReferencedLocation)) {
        unexportedToUnexportedRef.set(
          unexportedSymbol,
          unexportedToUnexportedRef.get(unexportedReferencedLocation)!
        );
      }
    }
  }
  const symbolsForInnerBit = new Map<string, string[]>();

  for (const [unexported, exported] of unexportedToExportedRef) {
    if (!symbolsForInnerBit.has(exported)) {
      symbolsForInnerBit.set(exported, []);
    }
    symbolsForInnerBit.get(exported)!.push(unexported);
  }

  const goodIdentifiers: Record<string, string> = {};

  const findIdentifier = (symbol: string): string => {
    if (rootSymbols.has(symbol)) {
      const name = accessibleSymbols[symbol].name;
      if (name === packageName) {
        return "/";
      }
      return name.replace(packageName, "");
    }
    const canon = canonicalExportLocations[symbol];
    assert(!!canon);
    const [exportName, parent] = canon;
    return `${findIdentifier(parent)}.${exportName}`;
  };

  for (const [symbolId, symbol] of Object.entries(accessibleSymbols)) {
    if (symbol.kind == "enum-member") continue;
    if (rootSymbols.has(symbolId)) {
      goodIdentifiers[symbolId] = symbol.name;
    } else if (canonicalExportLocations[symbolId]) {
      goodIdentifiers[symbolId] = findIdentifier(symbolId);
    } else {
      const exportedSymbol = unexportedToExportedRef.get(symbolId)!;
      assert(exportedSymbol !== undefined);
      const symbolsShownInUnexportedBit =
        symbolsForInnerBit.get(exportedSymbol)!;
      const innerThings = symbolsShownInUnexportedBit.filter(
        (x) => accessibleSymbols[x].name === symbol.name
      );
      const identifier = `${findIdentifier(exportedSymbol)}.${symbol.name}`;
      if (innerThings.length === 1) {
        goodIdentifiers[symbolId] = identifier;
      } else {
        const index = innerThings.indexOf(symbolId);
        goodIdentifiers[symbolId] = `${identifier}-${index}`;
      }
    }
    if (symbol.kind === "enum") {
      for (const childSymbolId of symbol.members) {
        goodIdentifiers[
          childSymbolId
        ] = `${goodIdentifiers[symbolId]}.${accessibleSymbols[childSymbolId].name}`;
      }
    }
  }
  return {
    goodIdentifiers,
    symbolsForInnerBit: Object.fromEntries(symbolsForInnerBit),
  };
}

export async function collectEntrypointsOfPackage(
  project: Project,
  pkgName: string,
  pkgPath: string
) {
  const packageJsons = new Set([
    `${pkgPath}/package.json`,
    ...(await project
      .getFileSystem()
      .glob([
        `${pkgPath}/**/package.json`,
        `!${pkgPath}/node_modules/**/package.json`,
      ])),
  ]);
  const entrypoints = new Map<string, string>();
  const moduleResolutionCache = ts.createModuleResolutionCache(
    project.getFileSystem().getCurrentDirectory(),
    (x) => x,
    project.getCompilerOptions()
  );
  for (const x of packageJsons) {
    const entrypoint = path.join(
      pkgName,
      x.replace(pkgPath, "").replace(/\/?package\.json$/, "")
    );
    const resolved = ts.resolveModuleName(
      entrypoint,
      "/index.js",
      project.getCompilerOptions(),
      project.getModuleResolutionHost(),
      moduleResolutionCache
    ).resolvedModule?.resolvedFileName;
    if (!resolved) continue;
    entrypoints.set(entrypoint, resolved);
  }
  return entrypoints;
}

export function resolveToPackageVersion(
  pkg: PackageMetadata,
  specifier: string | undefined
): string {
  if (specifier !== undefined) {
    if (Object.prototype.hasOwnProperty.call(pkg.tags, specifier)) {
      return pkg.tags[specifier];
    }
    if (semver.validRange(specifier)) {
      const version = semver.maxSatisfying(pkg.versions, specifier);
      if (version) {
        return version;
      }
    }
  }
  return pkg.tags.latest;
}
