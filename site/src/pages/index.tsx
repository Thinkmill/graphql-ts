import { InferGetStaticPropsType } from "next";
import { getInfo } from "../extract/index";
import { useContext, useEffect, Fragment } from "react";
import { Tooltip, Stack } from "@chakra-ui/react";
import { TypeParam, SerializedType } from "../extract/utils";
import hashString from "@emotion/hash";
import { DocsContext, useDocsContext } from "../lib/DocsContext";
import { colors, groupExports } from "../lib/utils";

import {
  SymbolName,
  SymbolReference,
  AddNameToScope,
} from "../components/symbol-references";
import { Docs } from "../components/docs";
import { Navigation } from "../components/navigation";
import { Contents, Header, NavigationContainer } from "../components/layout";
import { codeFont, themeClass } from "../lib/theme.css";

function SymbolAnchor({ fullName }: { fullName: string }) {
  const { goodIdentifiers } = useDocsContext();
  return (
    <a
      css={{ marginBottom: "1rem", display: "block", height: 1 }}
      id={goodIdentifiers[fullName]}
    ></a>
  );
}

function Type({ type }: { type: SerializedType }): JSX.Element {
  if (type.kind === "intrinsic") {
    return (
      <span className={codeFont} style={{ color: "#2c8093" }}>
        {type.value}
      </span>
    );
  }
  if (type.kind === "reference") {
    return (
      <span>
        <SymbolReference name={type.name} fullName={type.fullName} />
        {!!type.typeArguments.length && (
          <span>
            <span className={codeFont}>{"<"}</span>
            {type.typeArguments.map((param, i) => {
              return (
                <span key={i}>
                  <Type type={param} />
                  {i === type.typeArguments.length - 1 ? null : (
                    <span className={codeFont} style={{ color: colors.comma }}>
                      ,{" "}
                    </span>
                  )}
                </span>
              );
            })}
            <span className={codeFont}>{">"}</span>
          </span>
        )}
      </span>
    );
  }
  if (type.kind === "array") {
    return (
      <span>
        {type.readonly ? (
          <span className={codeFont} style={{ color: colors.keyword }}>
            readonly{" "}
          </span>
        ) : null}
        <Type type={type.inner} />
        <span className={codeFont} style={{ color: colors.bracket }}>
          []
        </span>
      </span>
    );
  }
  if (type.kind === "type-parameter") {
    return (
      <span className={codeFont} style={{ color: colors.parameter }}>
        {type.name}
      </span>
    );
  }
  if (type.kind === "union") {
    return (
      <span>
        {type.types.map((innerType, i) => {
          return (
            <span key={i}>
              <Type type={innerType} />
              {i !== type.types.length - 1 && (
                <span className={codeFont} style={{ color: colors.colon }}>
                  {" | "}
                </span>
              )}
            </span>
          );
        })}
      </span>
    );
  }
  if (type.kind === "intersection") {
    return (
      <span>
        {type.types.map((innerType, i) => {
          return (
            <span key={i}>
              <Type type={innerType} />
              {i !== type.types.length - 1 && (
                <span className={codeFont} style={{ color: colors.colon }}>
                  {" & "}
                </span>
              )}
            </span>
          );
        })}
      </span>
    );
  }
  if (type.kind === "object") {
    if (type.members.length === 0) {
      return <span className={codeFont}>{"{}"}</span>;
    }
    return (
      <span>
        <span className={codeFont}>{"{ "}</span>
        {type.members.map((prop, i) => {
          if (prop.kind === "prop") {
            return (
              <div key={i} style={{ marginLeft: 32 }}>
                <Docs content={prop.docs} />
                {prop.readonly ? (
                  <span className={codeFont} style={{ color: colors.keyword }}>
                    readonly{" "}
                  </span>
                ) : null}
                <span className={codeFont}>{prop.name}</span>
                <span className={codeFont} style={{ color: colors.colon }}>
                  {prop.optional ? "?: " : ": "}
                </span>
                <Type type={prop.type} />
                <span className={codeFont}>;</span>
              </div>
            );
          }
          if (prop.kind === "index") {
            return (
              <div key={i} style={{ marginLeft: 32 }}>
                <span className={codeFont}>
                  [key<span style={{ color: colors.colon }}>:</span>
                </span>
                <Type type={prop.key} />
                <span className={codeFont}>]</span>
                <span className={codeFont} style={{ color: colors.colon }}>
                  :
                </span>
                <Type type={prop.value} />
                <span className={codeFont}>;</span>
              </div>
            );
          }
          if (prop.kind === "unknown") {
            return (
              <div key={i} style={{ marginLeft: 32 }}>
                {prop.content}
              </div>
            );
          }
          return (
            <div key={i} style={{ marginLeft: 32 }}>
              <Docs content={prop.docs} />
              <span className={codeFont}>{prop.name}</span>
              <span className={codeFont} style={{ color: colors.colon }}>
                :{" "}
              </span>
              <Type type={prop.returnType} />
              <span className={codeFont}>;</span>
            </div>
          );
        })}
        <span className={codeFont}>{" }"}</span>
      </span>
    );
  }
  if (type.kind === "tuple") {
    return (
      <span>
        {type.readonly && (
          <span className={codeFont} style={{ color: colors.keyword }}>
            readonly{" "}
          </span>
        )}
        <span className={codeFont} style={{ color: colors.bracket }}>
          [
        </span>
        {type.elements.map((element, i) => {
          return (
            <span key={i}>
              {(element.kind === "rest" || element.kind === "variadic") && (
                <span className={codeFont} style={{ color: colors.colon }}>
                  ...
                </span>
              )}
              <Type type={element.type} />
              {element.kind === "optional" && (
                <span className={codeFont}>?</span>
              )}
              {element.kind === "rest" && (
                <span className={codeFont} style={{ color: colors.bracket }}>
                  []
                </span>
              )}
              {i !== type.elements.length - 1 && (
                <span className={codeFont} style={{ color: colors.comma }}>
                  ,{" "}
                </span>
              )}
            </span>
          );
        })}
        <span style={{ color: colors.bracket }}>]</span>
      </span>
    );
  }
  if (type.kind === "indexed-access") {
    return (
      <span>
        <Type type={type.object} />
        <span className={codeFont} style={{ color: colors.bracket }}>
          [
        </span>
        <Type type={type.index} />
        <span className={codeFont} style={{ color: colors.bracket }}>
          ]
        </span>
      </span>
    );
  }
  if (type.kind === "conditional") {
    return (
      <span>
        <Type type={type.checkType} />
        <span className={codeFont} style={{ color: colors.keyword }}>
          {" "}
          extends{" "}
        </span>
        <Type type={type.extendsType} />
        <span className={codeFont} style={{ color: colors.colon }}>
          {" "}
          ?{" "}
        </span>
        <Type type={type.trueType} />
        <span className={codeFont} style={{ color: colors.colon }}>
          {" "}
          :{" "}
        </span>
        <Type type={type.falseType} />
      </span>
    );
  }
  if (type.kind === "string-literal") {
    return (
      <span className={codeFont} style={{ color: colors.string }}>
        "{type.value}"
      </span>
    );
  }
  if (type.kind === "numeric-literal" || type.kind === "bigint-literal") {
    return (
      <span className={codeFont} style={{ color: colors.string }}>
        {type.value}
      </span>
    );
  }
  if (type.kind === "signature") {
    return (
      <Fragment>
        <TypeParams params={type.typeParams} />
        <span className={codeFont} style={{ color: colors.bracket }}>
          (
        </span>
        {type.parameters.map((param, i) => {
          return (
            <Fragment key={i}>
              <span className={codeFont} style={{ color: colors.parameter }}>
                {param.name}
              </span>
              <span className={codeFont} style={{ color: colors.colon }}>
                :
              </span>{" "}
              <Type type={param.type} />
              {i !== type.parameters.length - 1 && (
                <span className={codeFont} style={{ color: colors.comma }}>
                  ,{" "}
                </span>
              )}
            </Fragment>
          );
        })}
        <span className={codeFont} style={{ color: colors.bracket }}>
          )
        </span>
        <span className={codeFont} style={{ color: colors.keyword }}>
          {" => "}
        </span>
        <Type type={type.returnType} />
      </Fragment>
    );
  }
  if (type.kind === "infer") {
    return (
      <span className={codeFont}>
        <span style={{ color: colors.keyword }}>infer </span>
        <span style={{ color: colors.parameter }}>{type.name}</span>
      </span>
    );
  }
  if (type.kind === "mapped") {
    return (
      <span>
        <span className={codeFont}>{"{ "}</span>
        <br />
        <span style={{ paddingLeft: 32 }}>
          <span className={codeFont}>
            [<span style={{ color: colors.parameter }}>{type.param.name} </span>
            <span style={{ color: colors.keyword }}>in</span>{" "}
          </span>
          <Type type={type.param.constraint} />]
          <span className={codeFont} style={{ color: colors.colon }}>
            :{" "}
          </span>
          <Type type={type.type} />
          <span className={codeFont}>;</span>
          <br />
        </span>
        <span className={codeFont}>{" }"}</span>
      </span>
    );
  }

  if (type.kind === "keyof") {
    return (
      <Fragment>
        <span className={codeFont} style={{ color: colors.keyword }}>
          keyof{" "}
        </span>
        <Type type={type.value} />
      </Fragment>
    );
  }
  if (type.kind === "paren") {
    return (
      <Fragment>
        <span className={codeFont}>(</span>
        <Type type={type.value} />
        <span className={codeFont}>)</span>
      </Fragment>
    );
  }
  return (
    <span className={codeFont} style={{ color: "red" }}>
      {type.value}
    </span>
  );
}

function TypeParams({ params }: { params: TypeParam[] }) {
  if (!params.length) return null;
  return (
    <Fragment>
      <span style={{ color: colors.bracket }}>{"<"}</span>
      {params.map((param, i) => {
        return (
          <Fragment key={i}>
            <span className={codeFont} style={{ color: colors.parameter }}>
              {param.name}
            </span>
            {param.constraint && (
              <Fragment>
                <span className={codeFont} style={{ color: colors.keyword }}>
                  {" "}
                  extends{" "}
                </span>
                <Type type={param.constraint} />
              </Fragment>
            )}
            {param.default && (
              <Fragment>
                {" "}
                <span className={codeFont} style={{ color: colors.colon }}>
                  =
                </span>{" "}
                <Type type={param.default} />
              </Fragment>
            )}
            {i === params.length - 1 ? null : (
              <span className={codeFont} style={{ color: colors.comma }}>
                ,{" "}
              </span>
            )}
          </Fragment>
        );
      })}
      <span style={{ color: colors.bracket }}>{">"}</span>
    </Fragment>
  );
}

function openParentDetails(element: HTMLElement) {
  if (element instanceof HTMLDetailsElement) {
    element.open = true;
  }
  if (element.parentElement) {
    openParentDetails(element.parentElement);
  }
}

export default function Index(
  props: InferGetStaticPropsType<typeof getStaticProps>
) {
  const rootSymbols = new Set(props.rootSymbols);
  const unexportedToExportedRef = new Map<string, string>();
  const unexportedToUnexportedRef = new Map<string, string>();

  for (const [symbolFullName, symbols] of Object.entries(
    props.symbolReferences
  )) {
    if (!props.canonicalExportLocations[symbolFullName]) {
      const firstExportedSymbol = symbols.find(
        (x) => props.canonicalExportLocations[x] !== undefined
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
      return props.accessibleSymbols[symbol].name;
    }
    const canon = props.canonicalExportLocations[symbol];
    assert(!!canon);
    const { exportName, fileSymbolName } = canon;
    return `${findIdentifier(fileSymbolName)}.${exportName}`;
  };

  for (const [symbolId, symbol] of Object.entries(props.accessibleSymbols)) {
    if (rootSymbols.has(symbolId)) {
      goodIdentifiers[symbolId] = symbol.name;
    } else if (props.canonicalExportLocations[symbolId]) {
      goodIdentifiers[symbolId] = findIdentifier(symbolId);
    } else {
      const exportedSymbol = unexportedToExportedRef.get(symbolId)!;
      assert(exportedSymbol !== undefined);
      const symbolsShownInUnexportedBit =
        symbolsForInnerBit.get(exportedSymbol)!;
      const innerThings = symbolsShownInUnexportedBit.filter(
        (x) => props.accessibleSymbols[x].name === symbol.name
      );
      const identifier = `${findIdentifier(exportedSymbol)}.${symbol.name}`;
      if (innerThings.length === 1) {
        goodIdentifiers[symbolId] = identifier;
      } else {
        const index = innerThings.indexOf(symbolId);
        goodIdentifiers[symbolId] = `${identifier}-${index}`;
      }
    }
  }

  useEffect(() => {
    let handler = () => {
      const hash = window.location.hash.replace("#", "");
      const element = document.getElementById(hash);
      if (element) {
        openParentDetails(element);
        element.scrollIntoView();
      }
    };
    window.addEventListener("hashchange", handler, false);
    handler();
    return () => {
      window.removeEventListener("hashchange", handler);
    };
  }, []);

  return (
    <DocsContext.Provider
      value={{
        symbols: props.accessibleSymbols,
        hashesToFullNames: Object.fromEntries(
          Object.keys(props.accessibleSymbols).map((fullName) => {
            return ["a" + hashString(fullName), fullName];
          })
        ),
        references: props.symbolReferences,
        canonicalExportLocations: props.canonicalExportLocations,
        symbolsForInnerBit,
        goodIdentifiers,
        rootSymbols,
      }}
    >
      <div className={themeClass}>
        <Header />
        <div
          css={{
            display: "flex",
            justifyContent: "start",
            alignItems: "start",
          }}
        >
          <NavigationContainer>
            {props.rootSymbols.map((rootSymbol) => (
              <Navigation key={rootSymbol} rootSymbolName={rootSymbol} />
            ))}
          </NavigationContainer>
          <Contents>
            {props.rootSymbols.map((rootSymbol) => (
              <RenderRootThing key={rootSymbol} fullName={rootSymbol} />
            ))}
          </Contents>
        </div>
      </div>
    </DocsContext.Provider>
  );
}

function RenderRootThing({ fullName }: { fullName: string }) {
  const {
    symbols,
    canonicalExportLocations,
    references,
    symbolsForInnerBit,
    goodIdentifiers,
  } = useContext(DocsContext);
  let rootThing = symbols[fullName];
  let isExported = false;
  if (canonicalExportLocations[fullName]) {
    isExported = true;
    rootThing = {
      ...rootThing,
      name: canonicalExportLocations[fullName].exportName,
    };
  }
  if (rootThing.kind === "function") {
    const x = rootThing;
    return (
      <div>
        <Docs content={rootThing.docs} />
        <span>
          <span className={codeFont} style={{ color: colors.keyword }}>
            {isExported ? "export " : ""}function{" "}
          </span>
          <SymbolName name={rootThing.name} fullName={fullName} />
          <TypeParams params={rootThing.typeParams} />
          <span className={codeFont} style={{ color: colors.bracket }}>
            (
          </span>
          {rootThing.parameters.map((param, i) => {
            return (
              <span key={i}>
                <span className={codeFont} style={{ color: colors.parameter }}>
                  {param.name}
                </span>
                <span className={codeFont} style={{ color: colors.colon }}>
                  :{" "}
                </span>
                <Type type={param.type} />
                {x.parameters.length - 1 !== i && (
                  <span className={codeFont}>, </span>
                )}
              </span>
            );
          })}
          <span className={codeFont} style={{ color: colors.bracket }}>
            )
          </span>
          <span className={codeFont}>: </span>
          <Type type={rootThing.returnType} />
        </span>
      </div>
    );
  }
  if (rootThing.kind === "module") {
    const transformedExports = groupExports(
      fullName,
      canonicalExportLocations,
      symbols
    );

    const li = <li css={{ marginBottom: -24, marginLeft: -16 }} />;

    return (
      <div>
        <details open>
          {isExported ? (
            <summary css={{ display: "block" }}>
              <Docs content={rootThing.docs} />
              {li}

              <span className={codeFont} css={{ color: colors.keyword }}>
                export * as{" "}
              </span>
              <SymbolName name={rootThing.name} fullName={fullName} />
              <span className={codeFont} css={{ color: colors.keyword }}>
                {" "}
                from
              </span>
              <span className={codeFont} css={{ color: colors.bracket }}>
                {" {"}
              </span>
            </summary>
          ) : (
            <summary css={{ display: "block" }}>
              <Docs content={rootThing.docs} />
              {li}
              <span className={codeFont} css={{ color: colors.keyword }}>
                module{" "}
              </span>
              <a
                id={goodIdentifiers[fullName]}
                className={codeFont}
                css={{
                  color: colors.string,
                  ":hover": { textDecoration: "underline" },
                  ":target": { backgroundColor: "#ffff54ba" },
                }}
                href={`#${goodIdentifiers[fullName]}`}
              >
                {JSON.stringify(rootThing.name)}
              </a>
              <span className={codeFont} css={{ color: colors.bracket }}>
                {" {"}
              </span>
            </summary>
          )}
          <div css={{ padding: 32 }}>
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
                    <h1
                      className={codeFont}
                      css={{
                        "a:target + &": {
                          backgroundColor: "#ffff54ba",
                        },
                        fontSize: 38,
                        fontWeight: "bold",
                      }}
                    >
                      {exportName}
                    </h1>
                    <RenderRootThing fullName={symbol} />
                    {!!relatedSymbols?.length && (
                      <div css={{ paddingLeft: 32, paddingTop: 8 }}>
                        <p>References:</p>
                        <ul>
                          {relatedSymbols.map((thing, i) => {
                            return (
                              <li key={i}>
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
                      <details css={{ paddingTop: 8 }}>
                        <summary>
                          <Tooltip label="The symbols below were referenced in the symbol above(and potentially elsewhere) but are not exported publicly">
                            Unexported symbols referenced here
                          </Tooltip>
                        </summary>
                        <Stack spacing="6">
                          {innerBits.map((thing) => {
                            return (
                              <div key={thing}>
                                <RenderRootThing fullName={thing} />
                              </div>
                            );
                          })}
                        </Stack>
                      </details>
                    )}
                    <br />
                  </div>
                );
              }
              return (
                <div
                  key={i}
                  id={"a" + hashString(fullName) + `re-exports-${i}`}
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
                            name={x.sourceName}
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
        <span css={[{ color: colors.bracket }, codeFont]}>{"}"}</span>
      </div>
    );
  }
  if (rootThing.kind === "variable") {
    return (
      <div>
        <Docs content={rootThing.docs} />
        <span>
          <span className={codeFont} style={{ color: colors.keyword }}>
            {isExported ? "export " : ""}
            {rootThing.variableKind}{" "}
          </span>
          <SymbolName name={rootThing.name} fullName={fullName} />
          <span className={codeFont} style={{ color: colors.colon }}>
            :{" "}
          </span>
          <Type type={rootThing.type} />
          <span className={codeFont} style={{ color: colors.bracket }}>
            {" = "}
          </span>
          <span className={codeFont}>...</span>
        </span>
      </div>
    );
  }

  if (rootThing.kind === "unknown") {
    return (
      <div>
        <Docs content={rootThing.docs} />
        <SymbolName name={rootThing.name} fullName={fullName} />
        <pre className={codeFont}>
          <code>{rootThing.content}</code>
        </pre>
      </div>
    );
  }

  return (
    <div>
      <Docs content={rootThing.docs} />
      <span>
        <span className={codeFont} style={{ color: colors.keyword }}>
          {isExported ? "export " : ""}
          type{" "}
        </span>
        <AddNameToScope name={rootThing.name}>
          <SymbolName name={rootThing.name} fullName={fullName} />
          <TypeParams params={rootThing.typeParams} />
          <span className={codeFont}> = </span>
          <Type type={rootThing.type} />
        </AddNameToScope>
      </span>
    </div>
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
    <span>
      <ExportedFrom fullName={fileSymbolName} />.
      <SymbolReference fullName={fullName} name={exportName} />
    </span>
  );
}

export async function getStaticProps() {
  return { props: await getInfo() };
}

function assert(
  condition: boolean,
  message = "failed assert"
): asserts condition {
  if (!condition) {
    debugger;
    throw new Error(message);
  }
}
