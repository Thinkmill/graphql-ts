import { createContext, useContext } from "react";
import { SerializedSymbol } from "../extract/utils";

type SymbolId = string;

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
};

export const DocsContext = createContext<DocsContextType>(null as any);

export function useDocsContext() {
  return useContext(DocsContext);
}
