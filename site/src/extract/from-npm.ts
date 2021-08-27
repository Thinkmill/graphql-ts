import { Project, ModuleResolutionKind, ts, Symbol } from "ts-morph";
import decompress from "decompress";
import fetch from "node-fetch";
import path from "path";
import packageJson from "package-json";
import { getDocsInfo } from ".";

export async function getPackage(pkgName: string, version: string) {
  let project = new Project({
    compilerOptions: {
      noEmit: true,
      strict: true,
      moduleResolution: ModuleResolutionKind.NodeJs,
    },
    useInMemoryFileSystem: true,
  });

  const pkg = await packageJson(pkgName, { allVersions: true });
  const tarballURL: string = pkg.versions[version].dist.tarball;
  const tarballBuffer = await fetch(tarballURL).then((res) => res.buffer());
  const files = await decompress(tarballBuffer, {
    filter: (file) =>
      file.type === "directory" || /\.(json|ts|tsx)$/.test(file.path),
  });
  const fileSystem = project.getFileSystem();
  const pkgPath = `/node_modules/${pkgName}`;
  const packageJsons = ["package.json"];
  for (const file of files) {
    file.path = file.path.replace(/^package\//, "");
    if (file.type === "directory") {
      fileSystem.mkdirSync(`${pkgPath}/${file.path}`);
    } else {
      if (file.path.endsWith("/package.json")) {
        packageJsons.push(file.path);
      }
      fileSystem.writeFileSync(
        `${pkgPath}/${file.path}`,
        file.data.toString("utf8")
      );
    }
  }
  const entrypoints = new Map<string, string>();
  for (const x of packageJsons) {
    const entrypoint = path.join(pkgName, x.replace(/\/?package\.json$/, ""));
    const resolved = ts.resolveModuleName(
      entrypoint,
      "/index.js",
      project.getCompilerOptions(),
      project.getModuleResolutionHost()
    ).resolvedModule?.resolvedFileName;
    if (!resolved) continue;
    entrypoints.set(entrypoint, resolved);
  }

  project
    .createSourceFile(
      "/index.ts",
      [...entrypoints.keys()]
        .map((x) => `import ${JSON.stringify(x)};`)
        .join("\n")
    )
    .saveSync();
  project.resolveSourceFileDependencies();
  const rootSymbols = new Map<Symbol, string>();
  for (const [entrypoint, resolved] of entrypoints) {
    const sourceFile = project.getSourceFile(resolved);
    const sourceFileSymbol = sourceFile?.getSymbol();
    if (sourceFileSymbol) {
      rootSymbols.set(sourceFileSymbol, entrypoint);
    }
  }

  return {
    ...getDocsInfo(rootSymbols, `/node_modules/${pkgName}`, pkgName, version),
    versions: Object.keys(pkg.versions).reverse(),
  };
}
