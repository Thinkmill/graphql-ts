import { NextApiRequest, NextApiResponse } from "next";
import * as semver from "semver";
import { getPackageMetadata } from "../../extract/fetch-package-metadata";
import { resolveToPackageVersion } from "../../extract/utils";

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const pkg = req.query.pkg as string;
  const [, pkgName, specifier] = pkg.match(/^(@?[^@]+)(?:@(.+))?/)!;

  if (!specifier || !semver.parse(specifier)) {
    const pkg = await getPackageMetadata(pkgName);
    const version = resolveToPackageVersion(pkg, specifier);
    res.setHeader(
      "Cache-Control",
      `public, s-maxage=${60 * 20}, stale-while-revalidate=${60 * 60 * 8}`
    );
    return res.redirect(302, `/npm/${pkgName}@${version}`);
  }
  return res.send("already valid info");
}
