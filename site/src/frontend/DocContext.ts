import { createContext, useContext } from "react";
import { SerializedSymbol } from "../utils";

export type DocContextType = {
  symbols: Record<string, SerializedSymbol>;
  hashesToFullNames: Record<string, string>;
  references: Record<string, string[]>;
  canonicalExportLocations: Record<
    string,
    { exportName: string; fileSymbolName: string }
  >;
  symbolsForInnerBit: Map<string, string[]>;
  goodIdentifiers: Record<string, string>;
};

export const DocContext = createContext<DocContextType>(null as any);

export function useDocContext() {
  return useContext(DocContext);
}
