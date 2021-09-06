import ReactMarkdown, { Options as ReactMarkdownOptions } from "react-markdown";
import Highlight, { Prism } from "prism-react-renderer";
import { codeFont, colors } from "../lib/theme.css";
import { SymbolReference } from "./symbol-references";
import { useDocsContext } from "../lib/DocsContext";
import remarkGfm from "remark-gfm";

import * as styles from "./markdown.css";

export function Markdown({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      children={content}
      components={components}
    />
  );
}

const theme = {
  plain: {
    color: colors.coolGray600,
    backgroundColor: colors.gray50,
  },
  styles: [
    { types: ["class-name"], style: { color: colors.lightBlue700 } },
    { types: ["changed"], style: { color: colors.cyan400 } },
    { types: ["deleted"], style: { color: colors.red400 } },
    { types: ["inserted", "attr-name"], style: { color: colors.teal500 } },
    { types: ["comment"], style: { color: colors.blueGray500 } },
    {
      types: ["builtin", "char", "constant", "url"],
      style: { color: colors.teal700 },
    },
    { types: ["string"], style: { color: colors.pink400 } },
    { types: ["variable"], style: { color: colors.rose500 } },
    { types: ["number"], style: { color: colors.pink600 } },
    { types: ["punctuation"], style: { color: colors.blueGray400 } },
    {
      types: ["function", "selector", "doctype"],
      style: { color: colors.coolGray700 },
    },
    { types: ["tag"], style: { color: colors.fuchsia500 } },
    { types: ["operator"], style: { color: colors.blueGray400 } },
    {
      types: ["property", "keyword", "namespace"],
      style: { color: colors.lightBlue500 },
    },
    { types: ["boolean"], style: { color: colors.rose500 } },
  ],
};

const components: ReactMarkdownOptions["components"] = {
  code(props) {
    if (props.inline) {
      return <code className={codeFont}>{props.children}</code>;
    }
    return (
      <pre className={styles.codeblock}>
        <Highlight
          Prism={Prism}
          code={props.children.join("").trim()}
          language="tsx"
          theme={theme}
        >
          {({
            className,
            style,
            tokens: tokens,
            getLineProps,
            getTokenProps,
          }) => {
            return (
              <div
                className={`${className} ${styles.codeblockInner}`}
                style={style}
              >
                {tokens.map((line, i) => {
                  return (
                    <div key={i} {...getLineProps({ line, key: i })}>
                      {line.map((token, key) => {
                        // Fix for document field import
                        if (
                          token.content === "document" &&
                          token.types[0] === "imports"
                        ) {
                          token.types = ["imports"];
                        }
                        // Fix for `type:` property
                        if (token.content === "type") {
                          token.types = ["plain"];
                        }
                        return (
                          <span key={key} {...getTokenProps({ token, key })} />
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            );
          }}
        </Highlight>
      </pre>
    );
  },
  a(props) {
    let href = ((props.node.properties as any).href as string) || "";
    const { symbols, goodIdentifiers } = useDocsContext();
    const fullName = href.replace("#symbol-", "");

    if (
      symbols[fullName] &&
      props.node.children.length === 1 &&
      props.node.children[0].type === "text" &&
      props.node.children[0].value === symbols[fullName].name
    ) {
      return (
        <SymbolReference name={symbols[fullName].name} fullName={fullName} />
      );
    }
    if (symbols[fullName]) {
      href = `#${goodIdentifiers[fullName]}`;
    }
    return (
      <a className={styles.a} href={href}>
        {props.children}
      </a>
    );
  },
};
