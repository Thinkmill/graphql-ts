import {
  Project,
  ModuleResolutionKind,
  ts,
  Symbol,
  SourceFile,
} from "ts-morph";
import decompress from "decompress";
import fetch from "node-fetch";
import packageJson from "package-json";
import { getDocsInfo } from ".";
import { collectEntrypointsOfPackage, resolveToPackageVersion } from "./utils";

async function addPackageToNodeModules(
  project: Project,
  pkgName: string,
  pkgSpecifier: string
) {
  const pkg = await packageJson(pkgName, { allVersions: true });
  const version = resolveToPackageVersion(pkg, pkgSpecifier);
  const tarballURL: string = pkg.versions[version].dist.tarball;
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
  return { pkgPath, version, versions: pkg.versions };
}

export async function getPackage(pkgName: string, pkgSpecifier: string) {
  let project = new Project({
    compilerOptions: {
      noEmit: true,
      strict: true,
      moduleResolution: ModuleResolutionKind.NodeJs,
    },
    useInMemoryFileSystem: true,
  });

  const { versions, version, pkgPath } = await addPackageToNodeModules(
    project,
    pkgName,
    pkgSpecifier
  );

  const entrypoints = await collectEntrypointsOfPackage(
    project,
    pkgName,
    pkgPath
  );

  const visited = new Set<SourceFile>();
  const queue = new Set(
    [...entrypoints.values()].map((resolved) =>
      project.addSourceFileAtPath(resolved)
    )
  );

  const dependencies = collectUnresolvedPackages(project, queue, visited);

  const pkgJson = JSON.parse(
    await project.getFileSystem().readFile(`${pkgPath}/package.json`)
  );

  const externalPackages: Map<
    string,
    { version: string; pkg: string; id: string }
  > = new Map();

  await Promise.all(
    [...dependencies].map(async (dep) => {
      const specifier =
        pkgJson.dependencies?.[dep] ||
        pkgJson.optionalDependencies?.[dep] ||
        pkgJson.peerDependencies?.[dep];
      if (typeof specifier !== "string") return;
      const { version, pkgPath } = await addPackageToNodeModules(
        project,
        dep,
        specifier
      );

      const entrypoints = await collectEntrypointsOfPackage(
        project,
        dep,
        pkgPath
      );
      [...entrypoints.values()].map((resolved) =>
        project.addSourceFileAtPath(resolved)
      );

      const rootSymbols = new Map<Symbol, string>();
      for (const [entrypoint, resolved] of entrypoints) {
        const sourceFile = project.getSourceFile(resolved);
        const sourceFileSymbol = sourceFile?.getSymbol();
        if (sourceFileSymbol) {
          rootSymbols.set(sourceFileSymbol, entrypoint);
        }
      }
      const { goodIdentifiers } = getDocsInfo(
        rootSymbols,
        pkgPath,
        dep,
        version
      );
      for (const [symbolId, identifier] of Object.entries(goodIdentifiers)) {
        externalPackages.set(symbolId, { version, pkg: dep, id: identifier });
      }
    })
  );

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
    ...getDocsInfo(rootSymbols, pkgPath, pkgName, version, (symbolId) =>
      externalPackages.get(symbolId)
    ),
    versions: Object.keys(versions).reverse(),
  };
}

function collectUnresolvedPackages(
  project: Project,
  queue: Set<SourceFile>,
  visited: Set<SourceFile>
) {
  const collectedPackages = new Set<string>();

  while (queue.size) {
    const sourceFile: SourceFile = queue.values().next().value;
    queue.delete(sourceFile);
    if (visited.has(sourceFile)) {
      continue;
    }
    visited.add(sourceFile);
    const filepath = sourceFile.getFilePath();
    for (const node of sourceFile.getImportStringLiterals()) {
      const literal = node.getLiteralValue();
      const resolved = ts.resolveModuleName(
        literal,
        filepath,
        project.getCompilerOptions(),
        project.getModuleResolutionHost()
      ).resolvedModule?.resolvedFileName;
      if (resolved) {
        queue.add(project.addSourceFileAtPath(resolved));
        continue;
      }

      if (!literal.startsWith(".")) {
        const match = /^(@[^/]+\/[^\/]+|[^/]+)/.exec(literal);
        if (match) {
          collectedPackages.add(match[0]);
        }
      }
    }
  }
  return collectedPackages;
}
