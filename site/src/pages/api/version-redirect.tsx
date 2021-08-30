import { NextApiRequest, NextApiResponse } from "next";
import packageJson from "package-json";
import * as semver from "semver";
import { resolveToPackageVersion } from "../../extract/utils";

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const pkg = req.query.pkg as string;
  const [, pkgName, specifier] = pkg.match(/^(@?[^@]+)(?:@(.+))?/)!;

  if (!specifier || !semver.parse(specifier)) {
    const pkg = await packageJson(pkgName, { allVersions: true });
    const version = resolveToPackageVersion(pkg, specifier);
    return res.redirect(302, `/npm/${pkgName}@${version}`);
  }
  return res.send("already valid info");
}
