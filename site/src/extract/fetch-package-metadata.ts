import algoliasearch from "algoliasearch";

export class PackageNotFoundError extends Error {
  constructor(pkg: string) {
    super(`Package ${pkg} not found`);
  }
}

const index = algoliasearch(
  "OFCNCOG2CU",
  "f54e21fa3a2a0160595bb058179bfb1e"
).initIndex("npm-search");

export type PackageMetadata = {
  versions: string[];
  tags: Record<string, string>;
};

export async function getPackageMetadata(
  packageName: string
): Promise<PackageMetadata> {
  return index
    .getObject<{
      versions: Record<string, string>;
      tags: Record<string, string>;
    }>(packageName, { attributesToRetrieve: ["versions", "tags"] })
    .then((x) => {
      return {
        versions: Object.keys(x.versions),
        tags: x.tags,
      };
    });
}
