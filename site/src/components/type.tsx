import { Fragment } from "react";

import { TypeParam, SerializedType, Parameter } from "../extract/utils";
import { codeFont } from "../lib/theme.css";
import { colors } from "../lib/utils";

import { SymbolReference } from "./symbol-references";
import { Docs } from "./docs";

export function Type({ type }: { type: SerializedType }): JSX.Element {
  if (type.kind === "intrinsic") {
    return (
      <span className={codeFont} css={{ color: "#2c8093" }}>
        {type.value}
      </span>
    );
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
                    <span className={codeFont} css={{ color: colors.comma }}>
                      ,{" "}
                    </span>
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
        {type.readonly ? (
          <span className={codeFont} css={{ color: colors.keyword }}>
            readonly{" "}
          </span>
        ) : null}
        <Type type={type.inner} />
        <span className={codeFont} css={{ color: colors.bracket }}>
          []
        </span>
      </Fragment>
    );
  }
  if (type.kind === "type-parameter") {
    return (
      <span className={codeFont} css={{ color: colors.parameter }}>
        {type.name}
      </span>
    );
  }
  if (type.kind === "union") {
    return (
      <Fragment>
        {type.types.map((innerType, i) => {
          return (
            <Fragment key={i}>
              <Type type={innerType} />
              {i !== type.types.length - 1 && (
                <span className={codeFont} css={{ color: colors.colon }}>
                  {" | "}
                </span>
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
                <span className={codeFont} css={{ color: colors.colon }}>
                  {" & "}
                </span>
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
              <div key={i} css={{ marginLeft: 16 }}>
                <Docs content={prop.docs} />
                {prop.readonly ? (
                  <span className={codeFont} css={{ color: colors.keyword }}>
                    readonly{" "}
                  </span>
                ) : null}
                <span className={codeFont}>{prop.name}</span>
                <span className={codeFont} css={{ color: colors.colon }}>
                  {prop.optional ? "?: " : ": "}
                </span>
                <Type type={prop.type} />
                <span className={codeFont}>;</span>
              </div>
            );
          }
          if (prop.kind === "index") {
            return (
              <div key={i} css={{ marginLeft: 16 }}>
                <span className={codeFont}>
                  [key<span css={{ color: colors.colon }}>: </span>
                </span>
                <Type type={prop.key} />
                <span className={codeFont}>]</span>
                <span className={codeFont} css={{ color: colors.colon }}>
                  :{" "}
                </span>
                <Type type={prop.value} />
                <span className={codeFont}>;</span>
              </div>
            );
          }
          if (prop.kind === "unknown") {
            return (
              <div className={codeFont} key={i} css={{ marginLeft: 16 }}>
                {prop.content}
              </div>
            );
          }
          return (
            <div key={i} css={{ marginLeft: 16 }}>
              <Docs content={prop.docs} />
              <span className={codeFont}>{prop.name}</span>
              <TypeParams params={prop.typeParams} />
              <Params params={prop.parameters} />
              <span className={codeFont} css={{ color: colors.colon }}>
                :{" "}
              </span>
              <Type type={prop.returnType} />
              <span className={codeFont}>;</span>
            </div>
          );
        })}
        <span className={codeFont}>{" }"}</span>
      </Fragment>
    );
  }
  if (type.kind === "tuple") {
    return (
      <Fragment>
        {type.readonly && (
          <span className={codeFont} css={{ color: colors.keyword }}>
            readonly{" "}
          </span>
        )}
        <span className={codeFont} css={{ color: colors.bracket }}>
          [
        </span>
        {type.elements.map((element, i) => {
          return (
            <Fragment key={i}>
              {(element.kind === "rest" || element.kind === "variadic") && (
                <span className={codeFont} css={{ color: colors.colon }}>
                  ...
                </span>
              )}
              <Type type={element.type} />
              {element.kind === "optional" && (
                <span className={codeFont}>?</span>
              )}
              {element.kind === "rest" && (
                <span className={codeFont} css={{ color: colors.bracket }}>
                  []
                </span>
              )}
              {i !== type.elements.length - 1 && (
                <span className={codeFont} css={{ color: colors.comma }}>
                  ,{" "}
                </span>
              )}
            </Fragment>
          );
        })}
        <span css={{ color: colors.bracket }}>]</span>
      </Fragment>
    );
  }
  if (type.kind === "indexed-access") {
    return (
      <Fragment>
        <Type type={type.object} />
        <span className={codeFont} css={{ color: colors.bracket }}>
          [
        </span>
        <Type type={type.index} />
        <span className={codeFont} css={{ color: colors.bracket }}>
          ]
        </span>
      </Fragment>
    );
  }
  if (type.kind === "conditional") {
    return (
      <Fragment>
        <Type type={type.checkType} />
        <span className={codeFont} css={{ color: colors.keyword }}>
          {" "}
          extends{" "}
        </span>
        <Type type={type.extendsType} />
        <span className={codeFont} css={{ color: colors.colon }}>
          {" "}
          ?{" "}
        </span>
        <Type type={type.trueType} />
        <span className={codeFont} css={{ color: colors.colon }}>
          {" "}
          :{" "}
        </span>
        <Type type={type.falseType} />
      </Fragment>
    );
  }
  if (type.kind === "string-literal") {
    return (
      <span className={codeFont} css={{ color: colors.string }}>
        "{type.value}"
      </span>
    );
  }
  if (type.kind === "numeric-literal" || type.kind === "bigint-literal") {
    return (
      <span className={codeFont} css={{ color: colors.string }}>
        {type.value}
      </span>
    );
  }
  if (type.kind === "signature") {
    return (
      <Fragment>
        <TypeParams params={type.typeParams} />
        <span className={codeFont} css={{ color: colors.bracket }}>
          (
        </span>
        {type.parameters.map((param, i) => {
          return (
            <Fragment key={i}>
              <span className={codeFont} css={{ color: colors.parameter }}>
                {param.name}
              </span>
              <span className={codeFont} css={{ color: colors.colon }}>
                :{" "}
              </span>
              <Type type={param.type} />
              {i !== type.parameters.length - 1 && (
                <span className={codeFont} css={{ color: colors.comma }}>
                  ,{" "}
                </span>
              )}
            </Fragment>
          );
        })}
        <span className={codeFont} css={{ color: colors.bracket }}>
          )
        </span>
        <span className={codeFont} css={{ color: colors.keyword }}>
          {" => "}
        </span>
        <Type type={type.returnType} />
      </Fragment>
    );
  }
  if (type.kind === "infer") {
    return (
      <span className={codeFont}>
        <span css={{ color: colors.keyword }}>infer </span>
        <span css={{ color: colors.parameter }}>{type.name}</span>
      </span>
    );
  }
  if (type.kind === "mapped") {
    return (
      <Fragment>
        <span className={codeFont}>{"{ "}</span>
        <div css={{ paddingLeft: 32 }}>
          <span className={codeFont}>
            [<span css={{ color: colors.parameter }}>{type.param.name} </span>
            <span css={{ color: colors.keyword }}>in</span>{" "}
          </span>
          <Type type={type.param.constraint} />]
          <span className={codeFont} css={{ color: colors.colon }}>
            :{" "}
          </span>
          <Type type={type.type} />
          <span className={codeFont}>;</span>
        </div>
        <span className={codeFont}>{" }"}</span>
      </Fragment>
    );
  }

  if (type.kind === "keyof") {
    return (
      <Fragment>
        <span className={codeFont} css={{ color: colors.keyword }}>
          keyof{" "}
        </span>
        <Type type={type.value} />
      </Fragment>
    );
  }
  if (type.kind === "paren") {
    return (
      <Fragment>
        <span className={codeFont}>(</span>
        <Type type={type.value} />
        <span className={codeFont}>)</span>
      </Fragment>
    );
  }
  if (type.kind === "typeof") {
    return (
      <Fragment>
        <span className={codeFont} css={{ color: colors.keyword }}>
          typeof{" "}
        </span>
        <SymbolReference fullName={type.fullName} name={type.name} />
      </Fragment>
    );
  }
  if (type.kind === "type-predicate") {
    return (
      <Fragment>
        {type.asserts && (
          <span className={codeFont} css={{ color: colors.keyword }}>
            asserts{" "}
          </span>
        )}
        <span className={codeFont}>{type.param}</span>
        <span className={codeFont} css={{ color: colors.keyword }}>
          {" is "}
        </span>
        <Type type={type.type} />
      </Fragment>
    );
  }
  return (
    <span className={codeFont} css={{ color: "red" }}>
      {type.value}
    </span>
  );
}

export function TypeParams({ params }: { params: TypeParam[] }) {
  if (!params.length) return null;
  return (
    <Fragment>
      <span css={{ color: colors.bracket }}>{"<"}</span>
      {params.map((param, i) => {
        return (
          <Fragment key={i}>
            <span className={codeFont} css={{ color: colors.parameter }}>
              {param.name}
            </span>
            {param.constraint && (
              <Fragment>
                <span className={codeFont} css={{ color: colors.keyword }}>
                  {" "}
                  extends{" "}
                </span>
                <Type type={param.constraint} />
              </Fragment>
            )}
            {param.default && (
              <Fragment>
                <span className={codeFont} css={{ color: colors.colon }}>
                  {" = "}
                </span>
                <Type type={param.default} />
              </Fragment>
            )}
            {i === params.length - 1 ? null : (
              <span className={codeFont} css={{ color: colors.comma }}>
                ,{" "}
              </span>
            )}
          </Fragment>
        );
      })}
      <span css={{ color: colors.bracket }}>{">"}</span>
    </Fragment>
  );
}

export function Params({ params }: { params: Parameter[] }) {
  return (
    <Fragment>
      <span className={codeFont} css={{ color: colors.bracket }}>
        {"("}
      </span>
      {params.map((param, i) => {
        return (
          <Fragment key={i}>
            <span className={codeFont} css={{ color: colors.parameter }}>
              {param.name}
            </span>
            <span className={codeFont} css={{ color: colors.colon }}>
              {param.optional ? "?: " : ": "}
            </span>
            <Type type={param.type} />
            {i === params.length - 1 ? null : (
              <span className={codeFont} css={{ color: colors.comma }}>
                ,{" "}
              </span>
            )}
          </Fragment>
        );
      })}
      <span className={codeFont} css={{ color: colors.bracket }}>
        {")"}
      </span>
    </Fragment>
  );
}
