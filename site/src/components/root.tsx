import { useEffect } from "react";

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

export function Root(props: import("../extract").DocInfo) {
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
        references: props.symbolReferences,
        canonicalExportLocations: props.canonicalExportLocations,
        symbolsForInnerBit: new Map(Object.entries(props.symbolsForInnerBit)),
        goodIdentifiers: props.goodIdentifiers,
        rootSymbols: new Set(props.rootSymbols),
      }}
    >
      <div className={themeClass}>
        <Header packageName={props.packageName} />
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
