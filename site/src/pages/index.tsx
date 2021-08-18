import { InferGetStaticPropsType } from "next";
import {
  accessibleSymbols,
  stuff,
  _exportedSymbols,
  canonicalExportLocations as _canonicalExportLocations,
} from "../index";
import { useContext, useEffect } from "react";
import { Tooltip, Heading, Stack } from "@chakra-ui/react";
import { TypeParam, SerializedType } from "../utils";
import hashString from "@emotion/hash";
import { DocContext, useDocContext } from "../frontend/DocContext";
import { codeFont, colors, groupExports, splitDocs } from "../frontend/utils";
import { Markdown } from "../frontend/markdown";
import {
  SymbolName,
  SymbolReference,
  AddNameToScope,
} from "../frontend/symbol-references";
import { Navigation } from "../frontend/Navigation";

function SymbolAnchor({ fullName }: { fullName: string }) {
  const { goodIdentifiers } = useDocContext();
  return (
    <a
      css={{ marginBottom: "1rem", display: "block", height: 1 }}
      id={goodIdentifiers[fullName]}
    ></a>
  );
}

function Type({ type }: { type: SerializedType }): JSX.Element {
  if (type.kind === "intrinsic") {
    return <span style={{ color: "#2c8093" }}>{type.value}</span>;
  }
  if (type.kind === "reference") {
    return (
      <span>
        <SymbolReference name={type.name} fullName={type.fullName} />
        {!!type.typeArguments.length && (
          <span>
            {"<"}
            {type.typeArguments.map((param, i) => {
              return (
                <span key={i}>
                  <Type type={param} />
                  {i === type.typeArguments.length - 1 ? null : (
                    <span style={{ color: colors.comma }}>, </span>
                  )}
                </span>
              );
            })}
            {">"}
          </span>
        )}
      </span>
    );
  }
  if (type.kind === "array") {
    return (
      <span>
        {type.readonly ? (
          <span style={{ color: colors.keyword }}>readonly </span>
        ) : null}
        <Type type={type.inner} />
        <span style={{ color: colors.bracket }}>[]</span>
      </span>
    );
  }
  if (type.kind === "type-parameter") {
    return <span style={{ color: colors.parameter }}>{type.name}</span>;
  }
  if (type.kind === "union") {
    return (
      <span>
        {type.types.map((innerType, i) => {
          return (
            <span key={i}>
              <Type type={innerType} />
              {i !== type.types.length - 1 && (
                <span style={{ color: colors.colon }}> | </span>
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
                <span style={{ color: colors.colon }}> & </span>
              )}
            </span>
          );
        })}
      </span>
    );
  }
  if (type.kind === "object") {
    if (type.members.length === 0) {
      return <span>{"{}"}</span>;
    }
    return (
      <span>
        {"{ "}
        <br />

        {type.members.map((prop, i) => {
          if (prop.kind === "prop") {
            return (
              <span key={i} style={{ paddingLeft: 32 }}>
                {prop.readonly ? (
                  <span style={{ color: colors.keyword }}>readonly </span>
                ) : null}
                <span>{prop.name}</span>
                <span style={{ color: colors.colon }}>
                  {prop.optional ? "?" : ""}:
                </span>{" "}
                <Type type={prop.type} />;<br />
              </span>
            );
          }
          if (prop.kind === "index") {
            return (
              <span key={i} style={{ paddingLeft: 32 }}>
                {"  "}[key<span style={{ color: colors.colon }}>:</span>{" "}
                <Type type={prop.key} />]
                <span style={{ color: colors.colon }}>:</span>{" "}
                <Type type={prop.value} />;<br />
              </span>
            );
          }
          return (
            <span key={i} style={{ paddingLeft: 32 }}>
              {prop.name}
              <span style={{ color: colors.colon }}>: </span>
              <Type type={prop.returnType} />;<br />
            </span>
          );
        })}
        {" }"}
      </span>
    );
  }
  if (type.kind === "tuple") {
    return (
      <span>
        {type.readonly && (
          <span style={{ color: colors.keyword }}>readonly </span>
        )}
        <span style={{ color: colors.bracket }}>[</span>
        {type.elements.map((element, i) => {
          return (
            <span key={i}>
              {(element.kind === "rest" || element.kind === "variadic") && (
                <span style={{ color: colors.colon }}>...</span>
              )}
              <Type type={element.type} />
              {element.kind === "optional" && <span>?</span>}
              {element.kind === "rest" && (
                <span>
                  <span style={{ color: colors.bracket }}>[]</span>
                </span>
              )}
              {i !== type.elements.length - 1 && (
                <span style={{ color: colors.comma }}>, </span>
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
        <span style={{ color: colors.bracket }}>[</span>
        <Type type={type.index} />
        <span style={{ color: colors.bracket }}>]</span>
      </span>
    );
  }
  if (type.kind === "conditional") {
    return (
      <span>
        <Type type={type.checkType} />
        <span style={{ color: colors.keyword }}> extends </span>
        <Type type={type.extendsType} />
        <span style={{ color: colors.colon }}> ? </span>
        <Type type={type.trueType} />
        <span style={{ color: colors.colon }}> : </span>
        <Type type={type.falseType} />
      </span>
    );
  }
  if (type.kind === "string-literal") {
    return <span style={{ color: colors.string }}>"{type.value}"</span>;
  }
  if (type.kind === "numeric-literal" || type.kind === "bigint-literal") {
    return <span style={{ color: colors.string }}>{type.value}</span>;
  }
  if (type.kind === "signature") {
    return (
      <span>
        <TypeParams params={type.typeParams} />
        <span style={{ color: colors.bracket }}>(</span>
        {type.parameters.map((param, i) => {
          return (
            <span key={i}>
              <span style={{ color: colors.parameter }}>{param.name}</span>
              <span style={{ color: colors.colon }}>:</span>{" "}
              <Type type={param.type} />
              {i !== type.parameters.length - 1 && (
                <span style={{ color: colors.comma }}>, </span>
              )}
            </span>
          );
        })}
        <span style={{ color: colors.bracket }}>)</span>
        <span style={{ color: colors.keyword }}>{" => "}</span>
        <Type type={type.returnType} />
      </span>
    );
  }
  if (type.kind === "infer") {
    return (
      <span>
        <span style={{ color: colors.keyword }}>infer </span>
        <span style={{ color: colors.parameter }}>{type.name}</span>
      </span>
    );
  }
  if (type.kind === "mapped") {
    return (
      <span>
        {"{ "}
        <br />
        <span style={{ paddingLeft: 32 }}>
          [<span style={{ color: colors.parameter }}>{type.param.name} </span>
          <span style={{ color: colors.keyword }}>in</span>{" "}
          <Type type={type.param.constraint} />]
          <span style={{ color: colors.colon }}>:</span>{" "}
          <Type type={type.type} />;<br />
        </span>
        {" }"}
      </span>
    );
  }

  if (type.kind === "keyof") {
    return (
      <span>
        <span style={{ color: colors.keyword }}>keyof </span>
        <Type type={type.value} />
      </span>
    );
  }
  if (type.kind === "paren") {
    return (
      <span>
        (
        <Type type={type.value} />)
      </span>
    );
  }
  return <span style={{ color: "red" }}>{type.value}</span>;
}

function TypeParams({ params }: { params: TypeParam[] }) {
  if (!params.length) return null;
  return (
    <span>
      <span style={{ color: colors.bracket }}>{"<"}</span>
      {params.map((param, i) => {
        return (
          <span key={i}>
            <span style={{ color: colors.parameter }}>{param.name}</span>
            {param.constraint && (
              <span>
                {" "}
                <span style={{ color: colors.keyword }}>extends</span>{" "}
                <Type type={param.constraint} />
              </span>
            )}
            {param.default && (
              <span>
                {" "}
                <span style={{ color: colors.colon }}>=</span>{" "}
                <Type type={param.default} />
              </span>
            )}
            {i === params.length - 1 ? null : (
              <span style={{ color: colors.comma }}>, </span>
            )}
          </span>
        );
      })}
      <span style={{ color: colors.bracket }}>{">"}</span>
    </span>
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
    const canon = props.canonicalExportLocations[symbol];
    assert(!!canon);
    const { exportName, fileSymbolName } = canon;
    if (props.accessibleSymbols[fileSymbolName].name === "@graphql-ts/schema") {
      return exportName;
    }
    return `${findIdentifier(fileSymbolName)}.${exportName}`;
  };

  for (const [symbolId, symbol] of Object.entries(props.accessibleSymbols)) {
    if (symbol.name === "@graphql-ts/schema") {
      goodIdentifiers[symbolId] = "root";
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

  const rootSymbol = Object.keys(props.accessibleSymbols)[0];

  return (
    <DocContext.Provider
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
      }}
    >
      <Heading marginBottom="4">@graphql-ts/schema API Documentation</Heading>
      <div
        css={{
          display: "flex",
          justifyContent: "start",
          alignItems: "start",
        }}
      >
        <div css={{ marginLeft: 24, marginTop: 24 }}>
          <Navigation rootSymbolName={rootSymbol} />
        </div>
        <RenderRootThing fullName={rootSymbol} />{" "}
      </div>
    </DocContext.Provider>
  );
}

function Docs({ content }: { content: string | undefined }) {
  if (!content) return null;

  const { first, rest } = splitDocs(content);

  if (!rest) {
    return <Markdown content={first} />;
  }
  return (
    <details>
      <summary css={{ display: "block" }}>
        <li css={{ marginLeft: -16, marginBottom: -24 }} />
        <Markdown content={first} />
      </summary>
      <Markdown content={rest} />
    </details>
  );
}

function RenderRootThing({ fullName }: { fullName: string }) {
  const {
    symbols,
    canonicalExportLocations,
    references,
    symbolsForInnerBit,
    goodIdentifiers,
  } = useContext(DocContext);
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
    return (
      <div>
        <Docs content={rootThing.docs} />
        <span css={codeFont}>
          <span style={{ color: colors.keyword }}>
            {isExported ? "export " : ""}function
          </span>{" "}
          <SymbolName name={rootThing.name} fullName={fullName} />
          <TypeParams params={rootThing.typeParams} />
          <span style={{ color: colors.bracket }}>(</span>
          {rootThing.parameters.map((param, i) => {
            return (
              <span key={i}>
                <span style={{ color: colors.parameter }}>{param.name}</span>
                <span style={{ color: colors.colon }}>:</span>{" "}
                <Type type={param.type} />
              </span>
            );
          })}
          <span style={{ color: colors.bracket }}>)</span>:{" "}
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
              <span css={[{ color: colors.keyword }, codeFont]}>
                export * as{" "}
              </span>
              <SymbolName name={rootThing.name} fullName={fullName} />
              <span css={[{ color: colors.keyword }, codeFont]}> from</span>
              <span css={[{ color: colors.bracket }, codeFont]}>{" {"}</span>
            </summary>
          ) : (
            <summary css={{ display: "block" }}>
              <Docs content={rootThing.docs} />
              {li}
              <span css={[{ color: colors.keyword }, codeFont]}>module </span>
              <a
                id={goodIdentifiers[fullName]}
                css={[
                  codeFont,
                  {
                    color: colors.string,
                    ":hover": { textDecoration: "underline" },
                    ":target": { backgroundColor: "#ffff54ba" },
                  },
                ]}
                href={`#${goodIdentifiers[fullName]}`}
              >
                {JSON.stringify(rootThing.name)}
              </a>{" "}
              <span css={[{ color: colors.bracket }, codeFont]}>{" {"}</span>
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
                    <Heading
                      css={[
                        codeFont,
                        {
                          "a:target + &": {
                            backgroundColor: "#ffff54ba",
                          },
                        },
                      ]}
                    >
                      {exportName}
                    </Heading>
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
                  css={[
                    codeFont,
                    {
                      ":target": { backgroundColor: "#ffff54ba" },
                    },
                  ]}
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
                  <span css={{ color: colors.string }}>
                    {JSON.stringify(symbols[exported.from].name)}
                  </span>
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
        <span style={codeFont}>
          <span style={{ color: colors.keyword }}>
            {isExported ? "export " : ""}
            {rootThing.variableKind}
          </span>{" "}
          <SymbolName name={rootThing.name} fullName={fullName} />
          <span style={{ color: colors.colon }}>: </span>
          <Type type={rootThing.type} />
          <span style={{ color: colors.bracket }}>{" = "}</span>
          ...
        </span>
      </div>
    );
  }

  return (
    <div>
      <Docs content={rootThing.docs} />
      <span css={codeFont}>
        <span style={{ color: colors.keyword }}>
          {isExported ? "export " : ""}
          type
        </span>{" "}
        <AddNameToScope name={rootThing.name}>
          <SymbolName name={rootThing.name} fullName={fullName} />
          <TypeParams params={rootThing.typeParams} /> ={" "}
          <Type type={rootThing.type} />
        </AddNameToScope>
      </span>
    </div>
  );
}

export async function getStaticProps() {
  return {
    props: {
      accessibleSymbols: JSON.parse(
        JSON.stringify(accessibleSymbols)
      ) as typeof accessibleSymbols,
      symbolReferences: stuff,
      _exportedSymbols,
      canonicalExportLocations: _canonicalExportLocations,
    },
  };
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
