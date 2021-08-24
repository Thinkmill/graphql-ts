import { createContext, useContext } from "react";
import { SerializedSymbol } from "../extract/utils";

export type DocsContextType = {
  symbols: Record<string, SerializedSymbol>;
  references: Record<string, string[]>;
  canonicalExportLocations: Record<
    string,
    { exportName: string; fileSymbolName: string }
  >;
  symbolsForInnerBit: Map<string, string[]>;
  goodIdentifiers: Record<string, string>;
  rootSymbols: Set<string>;
};

export const DocsContext = createContext<DocsContextType>(null as any);

export function useDocsContext() {
  return useContext(DocsContext);
}
