import { Tooltip } from "@chakra-ui/react";
import { Fragment } from "react";

import { useDocsContext } from "../lib/DocsContext";
import { codeFont } from "../lib/theme.css";
import { groupExports } from "../lib/utils";

import { Docs } from "./docs";
import {
  SymbolName,
  SymbolReference,
  AddNameToScope,
} from "./symbol-references";
import { Params, Type, TypeParams } from "./type";

import * as styles from "./symbol.css";
import { ClassMember, Parameter, TypeParam } from "../extract/utils";
import { Syntax } from "./syntax";
import { Indent } from "./indent";
import { blockSummary } from "./docs.css";

function SymbolAnchor({ fullName }: { fullName: string }) {
  const { goodIdentifiers } = useDocsContext();
  return <a className={styles.symbolAnchor} id={goodIdentifiers[fullName]}></a>;
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
          <Syntax kind="keyword">{isExported ? "export " : ""}function </Syntax>
          <SymbolName name={rootSymbol.name} fullName={fullName} />
          <TypeParams params={rootSymbol.typeParams} />
          <Params params={rootSymbol.parameters} />
          <Syntax kind="colon">: </Syntax>
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
            <summary className={blockSummary}>
              <div className={styles.innerExportsHeading}>
                <Syntax kind="keyword">export * as </Syntax>
                <SymbolName name={rootSymbol.name} fullName={fullName} />
                <Syntax kind="keyword"> from</Syntax>
                <Syntax kind="bracket">{" {"}</Syntax>
              </div>
            </summary>
          ) : (
            <summary className={blockSummary}>
              <div className={styles.innerExportsHeading}>
                <Syntax kind="keyword">module </Syntax>
                <a
                  id={goodIdentifiers[fullName]}
                  className={styles.moduleSpecifierLink}
                  href={`#${goodIdentifiers[fullName]}`}
                >
                  {JSON.stringify(rootSymbol.name)}
                </a>
                <Syntax kind="bracket">{" {"}</Syntax>
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
                  className={styles.reexportTarget}
                >
                  <Syntax kind="keyword">export</Syntax>
                  <Syntax kind="bracket">{" { "}</Syntax>
                  <Indent>
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
                          <Syntax kind="keyword">as</Syntax>{" "}
                          <SymbolReference
                            fullName={x.fullName}
                            name={x.localName}
                          />
                          ,
                        </div>
                      );
                    })}
                  </Indent>
                  <Syntax kind="bracket">{" } "}</Syntax>
                  <Syntax kind="keyword">from </Syntax>{" "}
                  <ExportedFrom fullName={exported.from} />
                  <br />
                </div>
              );
            })}
          </div>
        </details>

        <div className={styles.innerExportsHeading}>
          <Syntax kind="bracket">{"}"}</Syntax>
        </div>
      </div>
    );
  }
  if (rootSymbol.kind === "variable") {
    return (
      <div className={styles.rootSymbolContainer}>
        <Docs content={rootSymbol.docs} />
        <Fragment>
          <Syntax kind="keyword">
            {isExported ? "export " : ""}
            {rootSymbol.variableKind}{" "}
          </Syntax>
          <SymbolName name={rootSymbol.name} fullName={fullName} />
          <Syntax kind="colon">: </Syntax>
          <Type type={rootSymbol.type} />
          <Syntax kind="bracket">{" = "}</Syntax>
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
          <Syntax kind="keyword">
            {isExported ? "export " : ""}
            interface{" "}
          </Syntax>
          <AddNameToScope name={rootSymbol.name} fullName={fullName}>
            <SymbolName name={rootSymbol.name} fullName={fullName} />
            <TypeParams params={rootSymbol.typeParams} />
            {!!rootSymbol.extends.length && (
              <Fragment>
                <Syntax kind="keyword"> extends </Syntax>
                {rootSymbol.extends.map((param, i) => {
                  return (
                    <Fragment key={i}>
                      <Type type={param} />
                      {i === interfaceSymbol.extends.length - 1 ? null : (
                        <Syntax kind="comma">{", "}</Syntax>
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
          <Syntax kind="keyword">
            {isExported ? "export " : ""}
            class{" "}
          </Syntax>
          <AddNameToScope name={rootSymbol.name} fullName={fullName}>
            <SymbolName name={rootSymbol.name} fullName={fullName} />
            <TypeParams params={rootSymbol.typeParams} />
            {!!classSymbol.extends && (
              <Fragment>
                <Syntax kind="keyword"> extends </Syntax>
                <Type type={classSymbol.extends} />
              </Fragment>
            )}
            {!!rootSymbol.implements.length && (
              <Fragment>
                <Syntax kind="keyword"> implements </Syntax>
                {rootSymbol.implements.map((param, i) => {
                  return (
                    <Fragment key={i}>
                      <Type type={param} />
                      {i === classSymbol.implements.length - 1 ? null : (
                        <Syntax kind="comma">{", "}</Syntax>
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
        <Syntax kind="keyword">
          {isExported ? "export " : ""}
          type{" "}
        </Syntax>
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
          <Indent key={i}>
            <Docs content={constructor.docs} />
            <Syntax kind="keyword">constructor</Syntax>
            <TypeParams params={constructor.typeParams} />
            <Params params={constructor.parameters} />
          </Indent>
        );
      })}
      {members.map((prop, i) => {
        if (prop.kind === "prop") {
          return (
            <Indent key={i}>
              <Docs content={prop.docs} />
              {prop.readonly ? <Syntax kind="keyword">readonly </Syntax> : null}
              <span className={codeFont}>{prop.name}</span>
              <Syntax kind="colon">{prop.optional ? "?: " : ": "}</Syntax>
              <Type type={prop.type} />
              <span className={codeFont}>;</span>
            </Indent>
          );
        }
        if (prop.kind === "index") {
          return (
            <Indent key={i}>
              <span className={codeFont}>
                [key<Syntax kind="colon">: </Syntax>
              </span>
              <Type type={prop.key} />
              <span className={codeFont}>]</span>
              <Syntax kind="colon">: </Syntax>
              <Type type={prop.value} />
              <span className={codeFont}>;</span>
            </Indent>
          );
        }
        if (prop.kind === "unknown") {
          return (
            <Indent key={i}>
              <span className={codeFont}>{prop.content}</span>
            </Indent>
          );
        }
        return (
          <Indent key={i}>
            <Docs content={prop.docs} />
            <span className={codeFont}>{prop.name}</span>
            <TypeParams params={prop.typeParams} />
            <Params params={prop.parameters} />
            <Syntax kind="colon">: </Syntax>
            <Type type={prop.returnType} />
            <span className={codeFont}>;</span>
          </Indent>
        );
      })}
      <span className={codeFont}>{" }"}</span>
    </Fragment>
  );
}
