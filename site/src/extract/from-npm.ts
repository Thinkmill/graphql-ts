import { Project, ModuleResolutionKind, ts } from "ts-morph";
import decompress from "decompress";
import fetch from "node-fetch";
import packageJson from "package-json";
import { getDocsInfo } from ".";

export async function getPackage(pkgName: string, version = "latest") {
  let project = new Project({
    compilerOptions: {
      noEmit: true,
      strict: true,
      moduleResolution: ModuleResolutionKind.NodeJs,
    },
    useInMemoryFileSystem: true,
  });

  const pkg = await packageJson(pkgName, { version });
  const tarballURL: string = (pkg as any).dist.tarball;
  const tarballBuffer = await fetch(tarballURL).then((res) => res.buffer());
  const files = await decompress(tarballBuffer, {
    filter: (file) =>
      file.type === "directory" || /\.(json|ts|tsx)$/.test(file.path),
  });
  const fileSystem = project.getFileSystem();
  const pkgPath = `/node_modules/${pkgName}`;
  for (const file of files) {
    file.path = file.path.replace(/^package\//, "");
    if (file.type === "directory") {
      fileSystem.mkdirSync(`${pkgPath}/${file.path}`);
    } else {
      fileSystem.writeFileSync(
        `${pkgPath}/${file.path}`,
        file.data.toString("utf8")
      );
    }
  }
  const resolved = ts.resolveModuleName(
    pkgName,
    "/index.js",
    project.getCompilerOptions(),
    project.getModuleResolutionHost()
  ).resolvedModule?.resolvedFileName;
  if (!resolved) throw new Error("could not resolve entrypoint");
  project.createSourceFile("/index.ts", `import '${pkgName}'`).saveSync();
  project.resolveSourceFileDependencies();
  const sourceFile = project.getSourceFile(resolved);
  if (!sourceFile) throw new Error("could not find source file");
  const sourceFileSymbol = sourceFile.getSymbolOrThrow();
  return getDocsInfo(new Map([[sourceFileSymbol, pkgName]]));
}
