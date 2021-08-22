import { InferGetStaticPropsType } from "next";
import { useEffect } from "react";
import hashString from "@emotion/hash";

import { getInfo } from "../extract/index";
import { DocsContext } from "../lib/DocsContext";

import { RenderRootSymbol } from "../components/symbol";
import { Navigation } from "../components/navigation";
import {
  Contents,
  Header,
  NavigationContainer,
  PageContainer,
} from "../components/layout";

import { themeClass } from "../lib/theme.css";

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
        <PageContainer>
          <NavigationContainer>
            {props.rootSymbols.map((rootSymbol) => (
              <Navigation key={rootSymbol} rootSymbolName={rootSymbol} />
            ))}
          </NavigationContainer>
          <Contents>
            {props.rootSymbols.map((rootSymbol) => (
              <RenderRootSymbol key={rootSymbol} fullName={rootSymbol} />
            ))}
          </Contents>
        </PageContainer>
      </div>
    </DocsContext.Provider>
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
