import { createContext, useContext, ReactNode, useMemo } from "react";
import { Tooltip } from "@chakra-ui/react";
import { SymbolId, useDocsContext } from "../lib/DocsContext";
import { codeFont } from "../lib/theme.css";
import { colors, splitDocs } from "../lib/utils";
import { Markdown } from "./markdown";
import { Syntax } from "./syntax";
import * as styles from "./symbol-references.css";

const NamesInScopeContext = createContext<Map<string, SymbolId>>(new Map());

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
      className={styles.symbolName}
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
  fullName,
  children,
}: {
  name: string;
  fullName: string;
  children: ReactNode;
}) {
  const namesInScope = useContext(NamesInScopeContext);
  const newNamesInScope = useMemo(
    () => new Map([...namesInScope, [name, fullName]]),
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
      <a className={styles.nonRootSymbolReference} href={externalReference}>
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
        <span className={styles.unknownExternalReference}>{name}</span>
      </Tooltip>
    );
  }

  const symbol = symbols[fullName];
  const firstDocsBit = splitDocs(symbol.docs).first;

  const isRootSymbol = rootSymbols.has(fullName);

  let inner = (
    <a
      className={
        isRootSymbol
          ? styles.rootSymbolReference
          : styles.nonRootSymbolReference
      }
      href={`#${goodIdentifiers[fullName]}`}
    >
      {isRootSymbol ? JSON.stringify(name) : name}
    </a>
  );

  if (firstDocsBit) {
    inner = (
      <Tooltip
        label={
          <span className={styles.tooltipMarkdownContent}>
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
        <Syntax kind="keyword">import</Syntax>
        <Syntax kind="bracket">(</Syntax>
        <SymbolReference
          fullName={canonicalExportLocation.fileSymbolName}
          name={symbols[canonicalExportLocation.fileSymbolName].name}
        />
        <Syntax kind="bracket">)</Syntax>.{inner}
      </span>
    );
  }

  return inner;
}
