import { createContext, useContext } from "react";
import { SerializedSymbol } from "./types";

export type SymbolId = string;

export type DocsContextType = {
  symbols: Record<SymbolId, SerializedSymbol>;
  references: Record<SymbolId, SymbolId[]>;
  canonicalExportLocations: Record<
    SymbolId,
    { exportName: string; fileSymbolName: SymbolId }
  >;
  symbolsForInnerBit: Map<SymbolId, SymbolId[]>;
  goodIdentifiers: Record<SymbolId, string>;
  rootSymbols: Set<SymbolId>;
  externalSymbols: Record<
    SymbolId,
    { pkg: string; version: string; id: string }
  >;
};

export const DocsContext = createContext<DocsContextType>(null as any);

export function useDocsContext() {
  return useContext(DocsContext);
}
