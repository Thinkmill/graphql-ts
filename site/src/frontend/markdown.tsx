import ReactMarkdown, { ReactMarkdownOptions } from "react-markdown";
import markdownRenderer from "chakra-ui-markdown-renderer";
import Highlight, { Prism } from "prism-react-renderer";
import { codeFont, colors } from "./utils";
import { SymbolReference } from "./symbol-references";
import { useDocContext } from "./DocContext";

export function Markdown({ content }: { content: string }) {
  return <ReactMarkdown children={content} components={components} />;
}

const chakraComponents = markdownRenderer();
const theme = {
  plain: {
    color: "#403f53",
    backgroundColor: "#FBFBFB",
  },
  styles: [
    { types: ["class-name"], style: { color: colors.symbol } },
    { types: ["changed"], style: { color: "rgb(162, 191, 252)" } },
    { types: ["deleted"], style: { color: "rgba(239, 83, 80, 0.56)" } },
    { types: ["inserted", "attr-name"], style: { color: "rgb(72, 118, 214)" } },
    { types: ["comment"], style: { color: "rgb(152, 159, 177)" } },
    {
      types: ["string", "builtin", "char", "constant", "url"],
      style: { color: "rgb(44, 128, 147)" },
    },
    { types: ["string"], style: { color: colors.string } },
    { types: ["variable"], style: { color: "rgb(201, 103, 101)" } },
    { types: ["number"], style: { color: "rgb(170, 9, 130)" } },
    { types: ["punctuation"], style: { color: colors.comma } },
    {
      types: ["function", "selector", "doctype"],
      style: { color: "rgb(153, 76, 195)" },
    },
    { types: ["tag"], style: { color: "rgb(153, 76, 195)" } },
    { types: ["operator"], style: { color: colors.colon } },
    {
      types: ["property", "keyword", "namespace"],
      style: { color: colors.keyword },
    },
    { types: ["boolean"], style: { color: "rgb(188, 84, 84)" } },
  ],
};

const components: ReactMarkdownOptions["components"] = {
  ...chakraComponents,
  code(props) {
    if (props.inline) {
      return <code css={codeFont}>{props.children}</code>;
    }
    return (
      <pre css={codeFont}>
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
                className={className}
                css={{
                  ...style,
                  backgroundColor: "transparent",
                }}
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
    const Comp = chakraComponents.a as "a";
    let href = ((props.node.properties as any).href as string) || "";
    const { symbols, goodIdentifiers } = useDocContext();
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
      <Comp css={{ color: "blue" }} href={href}>
        {props.children}
      </Comp>
    );
  },
};
