import assert from "node:assert/strict";
import { test } from "node:test";
import { resolve } from "node:path";
import { versionInfo } from "graphql";
import ts from "typescript";

test("defaultValue follows GraphQL.js deprecation metadata", () => {
  const projectRoot = process.cwd();
  const configPath = ts.findConfigFile(projectRoot, ts.sys.fileExists);
  assert(configPath);

  const config = ts.readConfigFile(configPath, ts.sys.readFile);
  const parsedConfig = ts.parseJsonConfigFileContent(
    config.config,
    ts.sys,
    projectRoot
  );
  const probePath = resolve(
    projectRoot,
    "test-project/default-value-deprecation.probe.ts"
  );
  const program = ts.createProgram([probePath], parsedConfig.options);
  const checker = program.getTypeChecker();
  const source = program.getSourceFile(probePath);
  assert(source);

  const defaultValueSymbols: ts.Symbol[] = [];
  source.forEachChild(function visit(node) {
    if (ts.isIdentifier(node) && node.text === "defaultValue") {
      const symbol = ts.isPropertyAssignment(node.parent)
        ? checker
            .getContextualType(node.parent.parent)
            ?.getProperty("defaultValue")
        : checker.getSymbolAtLocation(node);
      assert(symbol);
      defaultValueSymbols.push(symbol);
    }
    node.forEachChild(visit);
  });
  assert.equal(defaultValueSymbols.length, 2);

  for (const symbol of defaultValueSymbols) {
    const isDeprecated = symbol
      .getJsDocTags(checker)
      .some((tag) => tag.name === "deprecated");

    assert.equal(isDeprecated, versionInfo.major >= 17);
  }
});
