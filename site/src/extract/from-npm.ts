import {
  Project,
  ModuleResolutionKind,
  ts,
  Symbol,
  SourceFile,
} from "ts-morph";
import fetch from "node-fetch";
import semver from "semver";
import tar from "tar-stream";
import gunzip from "gunzip-maybe";
import getNpmTarballUrl from "get-npm-tarball-url";
import { DocInfo, getDocsInfo } from ".";
import { collectEntrypointsOfPackage, resolveToPackageVersion } from "./utils";
import { assertNever } from "../lib/assert";
import { getPackageMetadata } from "./fetch-package-metadata";

async function handleTarballStream(tarballStream: NodeJS.ReadableStream) {
  const extract = tarballStream.pipe(gunzip()).pipe(tar.extract());
  const entries = new Map<
    string,
    { kind: "directory" } | { kind: "file"; content: string }
  >();
  extract.on("entry", (headers, stream, next) => {
    if (headers.type === "directory") {
      entries.set(headers.name, { kind: "directory" });
      next();
      stream.resume();
      stream.on("end", next);
      return;
    }
    if (headers.type !== "file" || !/\.(json|ts|tsx)$/.test(headers.name)) {
      headers.size;
      stream.resume();
      stream.on("end", next);
      return;
    }

    streamToString(stream)
      .then((content) => {
        entries.set(headers.name, { kind: "file", content });
        next();
      })
      .catch((err) => (next as any)(err));
  });

  return new Promise<
    Map<string, { kind: "directory" } | { kind: "file"; content: string }>
  >((resolve, reject) => {
    extract.on("finish", () => {
      resolve(entries);
    });
    extract.on("error", (err) => {
      reject(err);
    });
  });
}

function streamToString(stream: NodeJS.ReadableStream) {
  return new Promise<string>((resolve, reject) => {
    let content = "";
    stream
      .on("error", reject)
      .on("data", (chunk) => {
        content += chunk.toString("utf8");
      })
      .on("end", () => resolve(content));
  });
}

async function getTarballAndVersions(pkgName: string, pkgSpecifier: string) {
  let pkgPromise = getPackageMetadata(pkgName);
  if (semver.valid(pkgSpecifier)) {
    let tarballBufferPromise = fetch(
      getNpmTarballUrl(pkgName, pkgSpecifier)
    ).then((res) => res.body);
    const results = await Promise.allSettled([
      pkgPromise,
      tarballBufferPromise,
    ]);
    if (results[0].status !== "fulfilled") {
      throw results[0].reason;
    }
    if (results[1].status === "fulfilled") {
      return {
        versions: Object.keys(results[0].value.versions),
        version: pkgSpecifier,
        tarballStream: results[1].value,
      };
    }
    pkgPromise = Promise.resolve(results[0].value);
  }
  const pkg = await pkgPromise;
  const version = resolveToPackageVersion(pkg, pkgSpecifier);
  const tarballURL: string = getNpmTarballUrl(pkgName, version);
  const tarballStream = await fetch(tarballURL).then((res) => res.body);
  return { tarballStream, version, versions: Object.keys(pkg.versions) };
}

async function addPackageToNodeModules(
  project: Project,
  pkgName: string,
  pkgSpecifier: string
) {
  const { version, versions, tarballStream } = await getTarballAndVersions(
    pkgName,
    pkgSpecifier
  );

  const fileSystem = project.getFileSystem();
  const pkgPath = `/node_modules/${pkgName}`;
  for (let [filepath, entry] of await handleTarballStream(tarballStream)) {
    filepath = `${pkgPath}${filepath.replace(/^[^/]+\/?/, "/")}`;
    if (entry.kind === "directory") {
      fileSystem.mkdirSync(filepath);
    } else if (entry.kind === "file") {
      fileSystem.writeFileSync(filepath, entry.content);
    } else {
      assertNever(entry);
    }
  }
  return { pkgPath, version, versions };
}

export async function getPackage(
  pkgName: string,
  pkgSpecifier: string
): Promise<DocInfo> {
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
    versions: [...versions].reverse(),
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
