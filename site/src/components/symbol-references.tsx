import { createContext, useContext, ReactNode, useMemo } from "react";
import { Tooltip } from "@chakra-ui/react";
import { useDocsContext } from "../lib/DocsContext";
import { codeFont } from "../lib/theme.css";
import { colors, splitDocs } from "../lib/utils";
import { Markdown } from "./markdown";

const NamesInScopeContext = createContext<Set<string>>(new Set());

export function SymbolName({
  fullName,
  name,
}: {
  name: string;
  fullName: string;
}) {
  const { goodIdentifiers } = useDocsContext();
  return (
    <a
      id={goodIdentifiers[fullName]}
      className={codeFont}
      css={{
        color: colors.symbol,
        ":hover": { textDecoration: "underline" },
        ":target": { backgroundColor: "#ffff54ba" },
      }}
      href={`#${goodIdentifiers[fullName]}`}
    >
      {name}
    </a>
  );
}

const externalReferences = new Map(
  Object.entries({
    Iterable:
      "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_iterable_protocol",
    Promise:
      "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise",
    GraphQLScalarType: "https://graphql.org/graphql-js/type/#graphqlscalartype",
  })
);

export function AddNameToScope({
  name,
  children,
}: {
  name: string;
  children: ReactNode;
}) {
  const namesInScope = useContext(NamesInScopeContext);
  const newNamesInScope = useMemo(
    () => new Set([...namesInScope, name]),
    [namesInScope, name]
  );
  return (
    <NamesInScopeContext.Provider value={newNamesInScope}>
      {children}
    </NamesInScopeContext.Provider>
  );
}

export function SymbolReference({
  fullName,
  name,
}: {
  name: string;
  fullName: string;
}) {
  const { symbols, canonicalExportLocations, goodIdentifiers, rootSymbols } =
    useDocsContext();
  const namesInScope = useContext(NamesInScopeContext);
  const externalReference = symbols[fullName]
    ? undefined
    : externalReferences.get(name);
  if (externalReference !== undefined) {
    return (
      <a
        css={[
          codeFont,
          { color: colors.symbol, ":hover": { textDecoration: "underline" } },
        ]}
        href={externalReference}
      >
        {name}
      </a>
    );
  }
  if (fullName === undefined || !symbols[fullName]) {
    return (
      <Tooltip
        hasArrow
        label="This symbol is defined outside of this package so it isn't included in this documentation"
      >
        <span className={codeFont} css={{ color: "#f92672" }}>
          {name}
        </span>
      </Tooltip>
    );
  }

  const symbol = symbols[fullName];
  const firstDocsBit = splitDocs(symbol.docs).first;

  const isRootSymbol = rootSymbols.has(fullName);

  let inner = (
    <a
      className={codeFont}
      css={{
        color: isRootSymbol ? colors.string : colors.symbol,
        ":hover": { textDecoration: "underline" },
      }}
      href={`#${goodIdentifiers[fullName]}`}
    >
      {isRootSymbol ? JSON.stringify(name) : name}
    </a>
  );

  if (firstDocsBit) {
    inner = (
      <Tooltip
        label={
          <span
            css={{
              "& :last-child": { marginBottom: 0 },
              "& *": {
                color: "inherit !important",
              },
            }}
          >
            <Markdown content={firstDocsBit} />
          </span>
        }
      >
        {inner}
      </Tooltip>
    );
  }

  if (
    namesInScope.has(name) &&
    canonicalExportLocations[fullName] !== undefined
  ) {
    const canonicalExportLocation = canonicalExportLocations[fullName];
    return (
      <span className={codeFont}>
        <span
          css={{
            color: colors.keyword,
          }}
        >
          import
        </span>
        <span css={{ color: colors.bracket }}>(</span>
        <SymbolReference
          fullName={canonicalExportLocation.fileSymbolName}
          name={symbols[canonicalExportLocation.fileSymbolName].name}
        />
        <span css={{ color: colors.bracket }}>)</span>.{inner}
      </span>
    );
  }

  return inner;
}
