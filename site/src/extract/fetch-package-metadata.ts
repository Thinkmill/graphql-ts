export class PackageNotFoundError extends Error {
  constructor(pkg: string) {
    super(`Package ${pkg} not found`);
  }
}

export async function getPackageMetadata(
  packageName: string
): Promise<import("package-json").AbbreviatedMetadata> {
  const packageUrl = new URL(
    encodeURIComponent(packageName).replace(/^%40/, "@"),
    "https://registry.npmjs.org"
  );

  return await fetch(packageUrl.toString(), {
    headers: {
      accept:
        "application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8, */*",
    },
  }).then((x) => {
    if (x.status === 404) {
      throw new PackageNotFoundError(packageName);
    }
    return x.json();
  });
}
