import {
  createContext,
  useContext,
  useEffect,
  useRef,
  ReactNode,
  RefObject,
} from "react";

import * as styles from "./symbol.css";

type SymbolContainer = {
  id: string;
  parents: string[];
};
type SymbolHeader = { headingRef: RefObject<HTMLDivElement> };
type Symbol = SymbolContainer & SymbolHeader;
type Symbols = Record<string, Symbol>;
type SymbolManagerAPI = {
  register: (symbol: Symbol) => void;
  unregister: (symbol: Symbol) => void;
};

const SymbolExportsManagerContext = createContext<SymbolManagerAPI>(
  {} as SymbolManagerAPI
);
const SymbolExportsContext = createContext<SymbolContainer | null>(null);

// TODO: Investigate using IntersectionObserver for this
// https://developers.google.com/web/updates/2017/09/sticky-headers
function updateOffsets(symbols: Symbols) {
  if (!document.scrollingElement) return;
  const { scrollTop } = document.scrollingElement;
  Object.entries(symbols).forEach(([, symbol]) => {
    const el = symbol.headingRef.current;
    if (!el) return;
    const top = symbol.parents.reduce((top, id) => {
      const parentEl = symbols[id].headingRef.current;
      if (!parentEl) return top;
      return top + parentEl.offsetHeight;
    }, 0);
    el.style.top = `${top}px`;
    // console.log(`${scrollTop + top} === ${el.offsetTop}`);
    if (el.offsetTop <= scrollTop + top) {
      el.classList.add(styles.innerExportsHeadingSticky);
    } else {
      el.classList.remove(styles.innerExportsHeadingSticky);
    }
  });
}

function updateZIndexes(symbols: Symbols) {
  Object.entries(symbols).forEach(([, symbol]) => {
    const el = symbol.headingRef.current;
    if (!el) return;
    el.style.zIndex = `1`;
    symbol.parents.forEach((id, i) => {
      const parentEl = symbols[id]?.headingRef.current;
      if (!parentEl) return;
      parentEl.style.zIndex = `${i + 2}`;
    }, 0);
  });
}

export function SymbolExportsManager({ children }: { children: ReactNode }) {
  const symbolsRef = useRef<{ symbols: Symbols }>({
    symbols: {},
  });
  const update = () => updateOffsets(symbolsRef.current.symbols);
  useEffect(() => {
    document.addEventListener("scroll", update);
    document.addEventListener("resize", update);
    return () => {
      document.removeEventListener("scroll", update);
      document.removeEventListener("resize", update);
    };
  }, []);
  const api: SymbolManagerAPI = {
    register: (symbol) => {
      symbolsRef.current.symbols[symbol.id] = symbol;
      update();
      updateZIndexes(symbolsRef.current.symbols);
    },
    unregister: (symbol) => {
      delete symbolsRef.current.symbols[symbol.id];
      updateZIndexes(symbolsRef.current.symbols);
    },
  };
  return (
    <SymbolExportsManagerContext.Provider value={api}>
      {children}
    </SymbolExportsManagerContext.Provider>
  );
}

export function SymbolExports({
  children,
  id,
}: {
  children: ReactNode;
  id: string;
}) {
  const parentContext = useContext(SymbolExportsContext);
  const parents = parentContext
    ? [...parentContext.parents, parentContext.id]
    : [];
  return (
    <SymbolExportsContext.Provider value={{ id, parents }}>
      {children}
    </SymbolExportsContext.Provider>
  );
}

export function SymbolExportsHeader({ children }: { children: ReactNode }) {
  const headingRef = useRef<HTMLDivElement>(null);
  const symbolManager = useContext(SymbolExportsManagerContext);
  const symbolContext = useContext(SymbolExportsContext);
  if (!symbolContext) {
    throw Error(
      "<SymbolExportsHeader> must appear inside a <SymbolExports> component"
    );
  }
  useEffect(() => {
    const symbol = { ...symbolContext, headingRef };
    symbolManager.register(symbol);
    return () => symbolManager.unregister(symbol);
  }, []);
  return (
    <div ref={headingRef} className={styles.innerExportsHeading}>
      {children}
    </div>
  );
}
