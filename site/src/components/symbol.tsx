import { Tooltip } from "@chakra-ui/react";
import { Fragment } from "react";

import { useDocsContext } from "../lib/DocsContext";
import { codeFont } from "../lib/theme.css";
import { colors, groupExports } from "../lib/utils";

import { Docs } from "./docs";
import {
  SymbolName,
  SymbolReference,
  AddNameToScope,
} from "./symbol-references";
import { Params, Type, TypeParams } from "./type";

import * as styles from "./symbol.css";
import { ClassMember, Parameter, TypeParam } from "../extract/utils";

function SymbolAnchor({ fullName }: { fullName: string }) {
  const { goodIdentifiers } = useDocsContext();
  return (
    <a css={{ display: "block", height: 1 }} id={goodIdentifiers[fullName]}></a>
  );
}

function ExportedFrom({ fullName }: { fullName: string }) {
  const docContext = useDocsContext();
  if (docContext.rootSymbols.has(fullName)) {
    return (
      <SymbolReference
        fullName={fullName}
        name={docContext.symbols[fullName].name}
      />
    );
  }
  const { exportName, fileSymbolName } =
    docContext.canonicalExportLocations[fullName];
  return (
    <Fragment>
      <ExportedFrom fullName={fileSymbolName} />.
      <SymbolReference fullName={fullName} name={exportName} />
    </Fragment>
  );
}

export function RenderRootSymbol({ fullName }: { fullName: string }) {
  const {
    symbols,
    canonicalExportLocations,
    references,
    symbolsForInnerBit,
    goodIdentifiers,
  } = useDocsContext();
  let rootSymbol = symbols[fullName];
  let isExported = false;
  if (canonicalExportLocations[fullName]) {
    isExported = true;
    rootSymbol = {
      ...rootSymbol,
      name: canonicalExportLocations[fullName].exportName,
    };
  }
  if (rootSymbol.kind === "function") {
    return (
      <div className={styles.rootSymbolContainer}>
        <Docs content={rootSymbol.docs} />
        <Fragment>
          <span className={codeFont} css={{ color: colors.keyword }}>
            {isExported ? "export " : ""}function{" "}
          </span>
          <SymbolName name={rootSymbol.name} fullName={fullName} />
          <TypeParams params={rootSymbol.typeParams} />
          <Params params={rootSymbol.parameters} />
          <span className={codeFont} css={{ color: colors.colon }}>
            :{" "}
          </span>
          <Type type={rootSymbol.returnType} />
        </Fragment>
      </div>
    );
  }
  if (rootSymbol.kind === "module") {
    const transformedExports = groupExports(
      fullName,
      canonicalExportLocations,
      symbols
    );

    return (
      <div className={styles.rootSymbolContainer}>
        {isExported ? (
          <Docs content={rootSymbol.docs} />
        ) : (
          <Fragment>
            <h2 className={styles.moduleHeading}>{rootSymbol.name}</h2>
            <Docs content={rootSymbol.docs} />
          </Fragment>
        )}
        <details open>
          {isExported ? (
            <summary css={{ display: "block" }}>
              <div className={styles.innerExportsHeading}>
                <span css={{ color: colors.keyword }}>export * as </span>
                <SymbolName name={rootSymbol.name} fullName={fullName} />
                <span css={{ color: colors.keyword }}> from</span>
                <span css={{ color: colors.bracket }}>{" {"}</span>
              </div>
            </summary>
          ) : (
            <summary css={{ display: "block" }}>
              <div className={styles.innerExportsHeading}>
                <span css={{ color: colors.keyword }}>module </span>
                <a
                  id={goodIdentifiers[fullName]}
                  css={{
                    color: colors.string,
                    ":hover": { textDecoration: "underline" },
                    ":target": { backgroundColor: "#ffff54ba" },
                  }}
                  href={`#${goodIdentifiers[fullName]}`}
                >
                  {JSON.stringify(rootSymbol.name)}
                </a>
                <span css={{ color: colors.bracket }}>{" {"}</span>
              </div>
            </summary>
          )}
          <div className={styles.innerExportsContainer}>
            {transformedExports.map((exported, i) => {
              if (exported.kind === "canonical") {
                const { exportName, fullName: symbol } = exported;
                const relatedSymbols = (references[symbol] || []).filter(
                  (thing) => symbols[thing].kind !== "module"
                );
                const innerBits = symbolsForInnerBit.get(symbol);
                return (
                  <div key={exportName}>
                    <SymbolAnchor fullName={symbol} />
                    <h3 className={styles.symbolHeading}>{exportName}</h3>
                    <RenderRootSymbol fullName={symbol} />
                    {!!relatedSymbols?.length && (
                      <div className={styles.referencesContainer}>
                        <h4 className={styles.referencesHeading}>
                          References:
                        </h4>
                        <ul>
                          {relatedSymbols.map((thing, i) => {
                            return (
                              <li key={i} className={styles.referenceItem}>
                                <SymbolReference
                                  key={i}
                                  fullName={thing}
                                  name={symbols[thing].name}
                                />
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                    {innerBits && (
                      <details className={styles.referencesContainer}>
                        <summary>
                          <Tooltip label="The symbols below were referenced in the symbol above (and potentially elsewhere) but are not exported publicly">
                            Unexported symbols referenced here
                          </Tooltip>
                        </summary>
                        {innerBits.map((thing) => {
                          return (
                            <div key={thing}>
                              <RenderRootSymbol fullName={thing} />
                            </div>
                          );
                        })}
                      </details>
                    )}
                  </div>
                );
              }
              return (
                <div
                  key={i}
                  id={goodIdentifiers[fullName] + `-re-exports-${i}`}
                  className={codeFont}
                  css={{
                    ":target": { backgroundColor: "#ffff54ba" },
                  }}
                >
                  <span css={{ color: colors.keyword }}>export</span>
                  {" {"}
                  <div css={{ paddingLeft: 16 }}>
                    {exported.exports.map((x) => {
                      if (x.localName === x.sourceName) {
                        return (
                          <div key={x.localName}>
                            <SymbolReference
                              fullName={x.fullName}
                              name={x.localName}
                            />
                            ,
                          </div>
                        );
                      }

                      return (
                        <div key={x.localName}>
                          <SymbolReference
                            fullName={x.fullName}
                            name={x.sourceName}
                          />{" "}
                          <span css={{ color: colors.keyword }}>as</span>{" "}
                          <SymbolReference
                            fullName={x.fullName}
                            name={x.localName}
                          />
                          ,
                        </div>
                      );
                    })}
                  </div>
                  {" } "}
                  <span css={{ color: colors.keyword }}>from </span>{" "}
                  <ExportedFrom fullName={exported.from} />
                  <br />
                </div>
              );
            })}
          </div>
        </details>
        <div
          css={{ color: colors.bracket }}
          className={styles.innerExportsHeading}
        >
          {"}"}
        </div>
      </div>
    );
  }
  if (rootSymbol.kind === "variable") {
    return (
      <div className={styles.rootSymbolContainer}>
        <Docs content={rootSymbol.docs} />
        <Fragment>
          <span className={codeFont} css={{ color: colors.keyword }}>
            {isExported ? "export " : ""}
            {rootSymbol.variableKind}{" "}
          </span>
          <SymbolName name={rootSymbol.name} fullName={fullName} />
          <span className={codeFont} css={{ color: colors.colon }}>
            :{" "}
          </span>
          <Type type={rootSymbol.type} />
          <span className={codeFont} css={{ color: colors.bracket }}>
            {" = "}
          </span>
          <span className={codeFont}>...</span>
        </Fragment>
      </div>
    );
  }

  if (rootSymbol.kind === "unknown") {
    return (
      <div className={styles.rootSymbolContainer}>
        <Docs content={rootSymbol.docs} />
        <SymbolName name={rootSymbol.name} fullName={fullName} />
        <pre className={codeFont}>
          <code>{rootSymbol.content}</code>
        </pre>
      </div>
    );
  }

  if (rootSymbol.kind === "interface") {
    const interfaceSymbol = rootSymbol;
    return (
      <div className={styles.rootSymbolContainer}>
        <Docs content={rootSymbol.docs} />
        <Fragment>
          <span className={codeFont} css={{ color: colors.keyword }}>
            {isExported ? "export " : ""}
            interface{" "}
          </span>
          <AddNameToScope name={rootSymbol.name} fullName={fullName}>
            <SymbolName name={rootSymbol.name} fullName={fullName} />
            <TypeParams params={rootSymbol.typeParams} />
            {!!rootSymbol.extends.length && (
              <Fragment>
                <span className={codeFont} css={{ color: colors.keyword }}>
                  {" "}
                  extends{" "}
                </span>
                {rootSymbol.extends.map((param, i) => {
                  return (
                    <Fragment key={i}>
                      <Type type={param} />
                      {i === interfaceSymbol.extends.length - 1 ? null : (
                        <span
                          className={codeFont}
                          css={{ color: colors.comma }}
                        >
                          {", "}
                        </span>
                      )}
                    </Fragment>
                  );
                })}
              </Fragment>
            )}
            <span className={codeFont}> </span>
            <Type type={{ kind: "object", members: rootSymbol.members }} />
          </AddNameToScope>
        </Fragment>
      </div>
    );
  }

  if (rootSymbol.kind === "class") {
    const classSymbol = rootSymbol;
    return (
      <div className={styles.rootSymbolContainer}>
        <Docs content={rootSymbol.docs} />
        <Fragment>
          <span className={codeFont} css={{ color: colors.keyword }}>
            {isExported ? "export " : ""}
            class{" "}
          </span>
          <AddNameToScope name={rootSymbol.name} fullName={fullName}>
            <SymbolName name={rootSymbol.name} fullName={fullName} />
            <TypeParams params={rootSymbol.typeParams} />
            {!!classSymbol.extends && (
              <Fragment>
                <span className={codeFont} css={{ color: colors.keyword }}>
                  {" "}
                  extends{" "}
                </span>
                <Type type={classSymbol.extends} />
              </Fragment>
            )}
            {!!rootSymbol.implements.length && (
              <Fragment>
                <span className={codeFont} css={{ color: colors.keyword }}>
                  {" "}
                  implements{" "}
                </span>
                {rootSymbol.implements.map((param, i) => {
                  return (
                    <Fragment key={i}>
                      <Type type={param} />
                      {i === classSymbol.implements.length - 1 ? null : (
                        <span
                          className={codeFont}
                          css={{ color: colors.comma }}
                        >
                          {", "}
                        </span>
                      )}
                    </Fragment>
                  );
                })}
              </Fragment>
            )}
            <span className={codeFont}> </span>
            <ClassMembers
              constructors={rootSymbol.constructors}
              members={rootSymbol.members}
            />
          </AddNameToScope>
        </Fragment>
      </div>
    );
  }

  return (
    <div className={styles.rootSymbolContainer}>
      <Docs content={rootSymbol.docs} />
      <Fragment>
        <span className={codeFont} css={{ color: colors.keyword }}>
          {isExported ? "export " : ""}
          type{" "}
        </span>
        <AddNameToScope name={rootSymbol.name} fullName={fullName}>
          <SymbolName name={rootSymbol.name} fullName={fullName} />
          <TypeParams params={rootSymbol.typeParams} />
          <span className={codeFont}> = </span>
          <Type type={rootSymbol.type} />
        </AddNameToScope>
      </Fragment>
    </div>
  );
}

function ClassMembers({
  members,
  constructors,
}: {
  constructors: {
    parameters: Parameter[];
    docs: string;
    typeParams: TypeParam[];
  }[];
  members: ClassMember[];
}) {
  if (members.length === 0 && constructors.length === 0) {
    return <span className={codeFont}>{"{}"}</span>;
  }
  return (
    <Fragment>
      <span className={codeFont}>{"{ "}</span>
      {constructors.map((constructor, i) => {
        return (
          <div key={i} css={{ marginLeft: 16 }}>
            <Docs content={constructor.docs} />
            <span className={codeFont} css={{ color: colors.keyword }}>
              constructor
            </span>
            <TypeParams params={constructor.typeParams} />
            <Params params={constructor.parameters} />
          </div>
        );
      })}
      {members.map((prop, i) => {
        if (prop.kind === "prop") {
          return (
            <div key={i} css={{ marginLeft: 16 }}>
              <Docs content={prop.docs} />
              {prop.readonly ? (
                <span className={codeFont} css={{ color: colors.keyword }}>
                  readonly{" "}
                </span>
              ) : null}
              <span className={codeFont}>{prop.name}</span>
              <span className={codeFont} css={{ color: colors.colon }}>
                {prop.optional ? "?: " : ": "}
              </span>
              <Type type={prop.type} />
              <span className={codeFont}>;</span>
            </div>
          );
        }
        if (prop.kind === "index") {
          return (
            <div key={i} css={{ marginLeft: 16 }}>
              <span className={codeFont}>
                [key<span css={{ color: colors.colon }}>: </span>
              </span>
              <Type type={prop.key} />
              <span className={codeFont}>]</span>
              <span className={codeFont} css={{ color: colors.colon }}>
                :{" "}
              </span>
              <Type type={prop.value} />
              <span className={codeFont}>;</span>
            </div>
          );
        }
        if (prop.kind === "unknown") {
          return (
            <div className={codeFont} key={i} css={{ marginLeft: 16 }}>
              {prop.content}
            </div>
          );
        }
        return (
          <div key={i} css={{ marginLeft: 16 }}>
            <Docs content={prop.docs} />
            <span className={codeFont}>{prop.name}</span>
            <TypeParams params={prop.typeParams} />
            <Params params={prop.parameters} />
            <span className={codeFont} css={{ color: colors.colon }}>
              :{" "}
            </span>
            <Type type={prop.returnType} />
            <span className={codeFont}>;</span>
          </div>
        );
      })}
      <span className={codeFont}>{" }"}</span>
    </Fragment>
  );
}
