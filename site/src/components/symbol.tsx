import { Tooltip, Stack } from "@chakra-ui/react";
import hashString from "@emotion/hash";

import { useDocsContext } from "../lib/DocsContext";
import { codeFont } from "../lib/theme.css";
import { colors, groupExports } from "../lib/utils";

import { Docs } from "./docs";
import {
  SymbolName,
  SymbolReference,
  AddNameToScope,
} from "./symbol-references";
import { Type, TypeParams } from "./type";

function SymbolAnchor({ fullName }: { fullName: string }) {
  const { goodIdentifiers } = useDocsContext();
  return (
    <a
      css={{ marginBottom: "1rem", display: "block", height: 1 }}
      id={goodIdentifiers[fullName]}
    ></a>
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
    const x = rootSymbol;
    return (
      <div>
        <Docs content={rootSymbol.docs} />
        <span>
          <span className={codeFont} style={{ color: colors.keyword }}>
            {isExported ? "export " : ""}function{" "}
          </span>
          <SymbolName name={rootSymbol.name} fullName={fullName} />
          <TypeParams params={rootSymbol.typeParams} />
          <span className={codeFont} style={{ color: colors.bracket }}>
            (
          </span>
          {rootSymbol.parameters.map((param, i) => {
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
          <Type type={rootSymbol.returnType} />
        </span>
      </div>
    );
  }
  if (rootSymbol.kind === "module") {
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
              <Docs content={rootSymbol.docs} />
              {li}

              <span className={codeFont} css={{ color: colors.keyword }}>
                export * as{" "}
              </span>
              <SymbolName name={rootSymbol.name} fullName={fullName} />
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
              <Docs content={rootSymbol.docs} />
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
                {JSON.stringify(rootSymbol.name)}
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
                    <RenderRootSymbol fullName={symbol} />
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
                          <Tooltip label="The symbols below were referenced in the symbol above (and potentially elsewhere) but are not exported publicly">
                            Unexported symbols referenced here
                          </Tooltip>
                        </summary>
                        <Stack spacing="6">
                          {innerBits.map((thing) => {
                            return (
                              <div key={thing}>
                                <RenderRootSymbol fullName={thing} />
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
  if (rootSymbol.kind === "variable") {
    return (
      <div>
        <Docs content={rootSymbol.docs} />
        <span>
          <span className={codeFont} style={{ color: colors.keyword }}>
            {isExported ? "export " : ""}
            {rootSymbol.variableKind}{" "}
          </span>
          <SymbolName name={rootSymbol.name} fullName={fullName} />
          <span className={codeFont} style={{ color: colors.colon }}>
            :{" "}
          </span>
          <Type type={rootSymbol.type} />
          <span className={codeFont} style={{ color: colors.bracket }}>
            {" = "}
          </span>
          <span className={codeFont}>...</span>
        </span>
      </div>
    );
  }

  if (rootSymbol.kind === "unknown") {
    return (
      <div>
        <Docs content={rootSymbol.docs} />
        <SymbolName name={rootSymbol.name} fullName={fullName} />
        <pre className={codeFont}>
          <code>{rootSymbol.content}</code>
        </pre>
      </div>
    );
  }

  return (
    <div>
      <Docs content={rootSymbol.docs} />
      <span>
        <span className={codeFont} style={{ color: colors.keyword }}>
          {isExported ? "export " : ""}
          type{" "}
        </span>
        <AddNameToScope name={rootSymbol.name}>
          <SymbolName name={rootSymbol.name} fullName={fullName} />
          <TypeParams params={rootSymbol.typeParams} />
          <span className={codeFont}> = </span>
          <Type type={rootSymbol.type} />
        </AddNameToScope>
      </span>
    </div>
  );
}
