import algoliasearch from "algoliasearch";
import {
  NPM_SEARCH_ALGOLIA_API_KEY,
  NPM_SEARCH_ALGOLIA_APP_ID,
  NPM_SEARCH_ALGOLIA_INDEX,
} from "../lib/constants";

export class PackageNotFoundError extends Error {
  constructor(pkg: string) {
    super(`Package ${pkg} not found`);
  }
}

const index = algoliasearch(
  NPM_SEARCH_ALGOLIA_APP_ID,
  NPM_SEARCH_ALGOLIA_API_KEY
).initIndex(NPM_SEARCH_ALGOLIA_INDEX);

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
