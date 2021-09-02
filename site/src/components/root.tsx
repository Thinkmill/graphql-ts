import React, { useEffect, useMemo, useState } from "react";

import { DocsContext } from "../lib/DocsContext";

import { RenderRootSymbol } from "../components/symbol";
import { SymbolExportsManager } from "../components/symbol-exports";
import { Navigation } from "../components/navigation";
import {
  Contents,
  Header,
  NavigationContainer,
  PageContainer,
} from "../components/layout";

import { themeClass } from "../lib/theme.css";
import { useRouter } from "next/router";

function openParentDetails(element: HTMLElement) {
  if (element instanceof HTMLDetailsElement) {
    element.open = true;
  }
  if (element.parentElement) {
    openParentDetails(element.parentElement);
  }
}

export function Root(props: import("../extract").DocInfo) {
  const router = useRouter();
  const [versionState, setVersionState] = useState({
    fromCurrentProps: props.currentVersion,
    current: props.currentVersion,
  });
  if (props.currentVersion !== versionState.fromCurrentProps) {
    setVersionState({
      current: props.currentVersion,
      fromCurrentProps: props.currentVersion,
    });
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
        references: props.symbolReferences,
        canonicalExportLocations: useMemo(
          () =>
            Object.fromEntries(
              Object.entries(props.canonicalExportLocations).map(
                ([key, [exportName, parent]]) =>
                  [key, { exportName, parent }] as const
              )
            ),
          [props.canonicalExportLocations]
        ),
        symbolsForInnerBit: new Map(Object.entries(props.symbolsForInnerBit)),
        goodIdentifiers: props.goodIdentifiers,
        rootSymbols: new Set(props.rootSymbols),
        externalSymbols: props.externalSymbols,
      }}
    >
      <SymbolExportsManager>
        <div className={themeClass}>
          <svg xmlns="http://www.w3.org/2000/svg" style={{ display: "none" }}>
            <symbol id="minus-icon" viewBox="0 0 20 20">
              <path
                fill="currentColor"
                fillRule="evenodd"
                d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </symbol>
          </svg>
          <Header packageName={props.packageName} />
          <PageContainer>
            <NavigationContainer>
              {props.versions && (
                <select
                  onChange={(event) => {
                    const newVersion = event.target.value;
                    router.push(`/npm/${props.packageName}@${newVersion}`);
                    setVersionState((x) => ({ ...x, current: newVersion }));
                  }}
                  value={versionState.current}
                  disabled={
                    versionState.current !== versionState.fromCurrentProps
                  }
                >
                  {props.versions.map((version) => (
                    <option key={version}>{version}</option>
                  ))}
                </select>
              )}
              {versionState.current !== versionState.fromCurrentProps && (
                <span aria-label="Loading new version">⏳</span>
              )}

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
      </SymbolExportsManager>
    </DocsContext.Provider>
  );
}
