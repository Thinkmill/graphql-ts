import React, { Fragment } from "react";

import { TypeParam, SerializedType, Parameter } from "../extract/utils";
import { codeFont } from "../lib/theme.css";

import { SymbolReference } from "./symbol-references";
import { Docs } from "./docs";
import { Syntax } from "./syntax";
import { Indent } from "./indent";
import * as styles from "./type.css";

export function Type({ type }: { type: SerializedType }): JSX.Element {
  if (type.kind === "intrinsic") {
    return <span className={styles.intrinsic}>{type.value}</span>;
  }
  if (type.kind === "reference") {
    return (
      <Fragment>
        <SymbolReference name={type.name} fullName={type.fullName} />
        {!!type.typeArguments.length && (
          <Fragment>
            <span className={codeFont}>{"<"}</span>
            {type.typeArguments.map((param, i) => {
              return (
                <Fragment key={i}>
                  <Type type={param} />
                  {i === type.typeArguments.length - 1 ? null : (
                    <Syntax kind="comma">, </Syntax>
                  )}
                </Fragment>
              );
            })}
            <span className={codeFont}>{">"}</span>
          </Fragment>
        )}
      </Fragment>
    );
  }
  if (type.kind === "array") {
    return (
      <Fragment>
        {type.readonly ? <Syntax kind="keyword">readonly </Syntax> : null}
        <Type type={type.inner} />
        <Syntax kind="bracket">[]</Syntax>
      </Fragment>
    );
  }
  if (type.kind === "type-parameter") {
    return <Syntax kind="parameter">{type.name}</Syntax>;
  }
  if (type.kind === "union") {
    return (
      <Fragment>
        {type.types.map((innerType, i) => {
          return (
            <Fragment key={i}>
              <Type type={innerType} />
              {i !== type.types.length - 1 && (
                <Syntax kind="colon">{" | "}</Syntax>
              )}
            </Fragment>
          );
        })}
      </Fragment>
    );
  }
  if (type.kind === "intersection") {
    return (
      <Fragment>
        {type.types.map((innerType, i) => {
          return (
            <Fragment key={i}>
              <Type type={innerType} />
              {i !== type.types.length - 1 && (
                <Syntax kind="colon">{" & "}</Syntax>
              )}
            </Fragment>
          );
        })}
      </Fragment>
    );
  }
  if (type.kind === "object") {
    if (type.members.length === 0) {
      return <span className={codeFont}>{"{}"}</span>;
    }
    return (
      <Fragment>
        <span className={codeFont}>{"{ "}</span>
        {type.members.map((prop, i) => {
          if (prop.kind === "prop") {
            return (
              <Indent key={i}>
                <Docs content={prop.docs} />
                {prop.readonly ? (
                  <Syntax kind="keyword">readonly </Syntax>
                ) : null}
                <span className={codeFont}>{prop.name}</span>
                <Syntax kind="colon">{prop.optional ? "?: " : ": "}</Syntax>
                <Type type={prop.type} />
                <span className={codeFont}>;</span>
              </Indent>
            );
          }
          if (prop.kind === "index") {
            return (
              <Indent key={i}>
                <span className={codeFont}>
                  [key<Syntax kind="colon">: </Syntax>
                </span>
                <Type type={prop.key} />
                <span className={codeFont}>]</span>
                <Syntax kind="colon">: </Syntax>
                <Type type={prop.value} />
                <span className={codeFont}>;</span>
              </Indent>
            );
          }
          if (prop.kind === "unknown") {
            return (
              <Indent key={i}>
                <span className={codeFont}>{prop.content}</span>
              </Indent>
            );
          }
          return (
            <Indent key={i}>
              <Docs content={prop.docs} />
              <span className={codeFont}>{prop.name}</span>
              <TypeParams params={prop.typeParams} />
              <Params params={prop.parameters} />
              <Syntax kind="colon">: </Syntax>
              <Type type={prop.returnType} />
              <span className={codeFont}>;</span>
            </Indent>
          );
        })}
        <span className={codeFont}>{" }"}</span>
      </Fragment>
    );
  }
  if (type.kind === "tuple") {
    return (
      <Fragment>
        {type.readonly && <Syntax kind="keyword">readonly </Syntax>}
        <Syntax kind="bracket">[</Syntax>
        {type.elements.map((element, i) => {
          return (
            <Fragment key={i}>
              {(element.kind === "rest" || element.kind === "variadic") && (
                <Syntax kind="colon">...</Syntax>
              )}
              <Type type={element.type} />
              {element.kind === "optional" && (
                <span className={codeFont}>?</span>
              )}
              {element.kind === "rest" && <Syntax kind="bracket">[]</Syntax>}
              {i !== type.elements.length - 1 && (
                <Syntax kind="comma">, </Syntax>
              )}
            </Fragment>
          );
        })}
        <Syntax kind="bracket">]</Syntax>
      </Fragment>
    );
  }
  if (type.kind === "indexed-access") {
    return (
      <Fragment>
        <Type type={type.object} />
        <Syntax kind="bracket">[</Syntax>
        <Type type={type.index} />
        <Syntax kind="bracket">]</Syntax>
      </Fragment>
    );
  }
  if (type.kind === "conditional") {
    return (
      <Fragment>
        <Type type={type.checkType} />
        <Syntax kind="keyword"> extends </Syntax>
        <Type type={type.extendsType} />
        <Syntax kind="colon"> ? </Syntax>
        <Type type={type.trueType} />
        <Syntax kind="colon"> : </Syntax>
        <Type type={type.falseType} />
      </Fragment>
    );
  }
  if (type.kind === "string-literal") {
    return <Syntax kind="string">"{type.value}"</Syntax>;
  }
  if (type.kind === "numeric-literal" || type.kind === "bigint-literal") {
    return <Syntax kind="string">{type.value}</Syntax>;
  }
  if (type.kind === "signature") {
    return (
      <Fragment>
        <TypeParams params={type.typeParams} />
        <Syntax kind="bracket">(</Syntax>
        {type.parameters.map((param, i) => {
          return (
            <Fragment key={i}>
              <Syntax kind="parameter">{param.name}</Syntax>
              <Syntax kind="colon">: </Syntax>
              <Type type={param.type} />
              {i !== type.parameters.length - 1 && (
                <Syntax kind="comma">, </Syntax>
              )}
            </Fragment>
          );
        })}
        <Syntax kind="bracket">)</Syntax>
        <Syntax kind="keyword">{" => "}</Syntax>
        <Type type={type.returnType} />
      </Fragment>
    );
  }
  if (type.kind === "infer") {
    return (
      <Fragment>
        <Syntax kind="keyword">infer </Syntax>
        <Syntax kind="parameter">{type.name}</Syntax>
      </Fragment>
    );
  }
  if (type.kind === "mapped") {
    return (
      <Fragment>
        <span className={codeFont}>{"{ "}</span>
        <Indent>
          <span className={codeFont}>
            [<Syntax kind="parameter">{type.param.name} </Syntax>
            <Syntax kind="keyword">in </Syntax>
          </span>
          <Type type={type.param.constraint} />]<Syntax kind="colon">: </Syntax>
          <Type type={type.type} />
          <span className={codeFont}>;</span>
        </Indent>
        <span className={codeFont}>{" }"}</span>
      </Fragment>
    );
  }

  if (type.kind === "keyof") {
    return (
      <Fragment>
        <Syntax kind="keyword">keyof </Syntax>
        <Type type={type.value} />
      </Fragment>
    );
  }
  if (type.kind === "paren") {
    return (
      <Fragment>
        <Syntax kind="bracket">(</Syntax>
        <Type type={type.value} />
        <Syntax kind="bracket">)</Syntax>
      </Fragment>
    );
  }
  if (type.kind === "typeof") {
    return (
      <Fragment>
        <Syntax kind="keyword">typeof </Syntax>
        <SymbolReference fullName={type.fullName} name={type.name} />
      </Fragment>
    );
  }
  if (type.kind === "type-predicate") {
    return (
      <Fragment>
        {type.asserts && <Syntax kind="keyword">asserts </Syntax>}
        <span className={codeFont}>{type.param}</span>
        {type.type && (
          <Fragment>
            <Syntax kind="keyword">{" is "}</Syntax>
            <Type type={type.type} />
          </Fragment>
        )}
      </Fragment>
    );
  }
  return (
    <span className={codeFont} style={{ color: "red" }}>
      {type.value}
      {type.tsKind && ` ${type.tsKind}`}
    </span>
  );
}

export function TypeParams({ params }: { params: TypeParam[] }) {
  if (!params.length) return null;
  return (
    <Fragment>
      <Syntax kind="bracket">{"<"}</Syntax>
      {params.map((param, i) => {
        return (
          <Fragment key={i}>
            <Syntax kind="parameter">{param.name}</Syntax>
            {param.constraint && (
              <Fragment>
                <Syntax kind="keyword"> extends </Syntax>
                <Type type={param.constraint} />
              </Fragment>
            )}
            {param.default && (
              <Fragment>
                <Syntax kind="colon">{" = "}</Syntax>
                <Type type={param.default} />
              </Fragment>
            )}
            {i === params.length - 1 ? null : <Syntax kind="comma">, </Syntax>}
          </Fragment>
        );
      })}
      <Syntax kind="bracket">{">"}</Syntax>
    </Fragment>
  );
}

export function Params({ params }: { params: Parameter[] }) {
  return (
    <Fragment>
      <Syntax kind="bracket">(</Syntax>
      {params.map((param, i) => {
        return (
          <Fragment key={i}>
            <Syntax kind="parameter">{param.name}</Syntax>
            <Syntax kind="colon">{param.optional ? "?: " : ": "}</Syntax>
            <Type type={param.type} />
            {i === params.length - 1 ? null : <Syntax kind="comma">, </Syntax>}
          </Fragment>
        );
      })}
      <Syntax kind="bracket">)</Syntax>
    </Fragment>
  );
}
