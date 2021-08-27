import { NextApiRequest, NextApiResponse } from "next";
import packageJson from "package-json";
import * as semver from "semver";

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const pkg = req.query.pkg as string;
  const [, pkgName, specifier] = pkg.match(/^(@?[^@]+)(?:@(.+))?/)!;

  if (!specifier || !semver.parse(specifier)) {
    const pkg = await packageJson(pkgName, { allVersions: true });
    if (Object.prototype.hasOwnProperty.call(pkg["dist-tags"], specifier)) {
      return res.redirect(
        302,
        `/npm/${pkgName}@${pkg["dist-tags"][specifier]}`
      );
    }
    if (semver.validRange(specifier)) {
      const version = semver.maxSatisfying(
        Object.keys(pkg.versions),
        specifier
      );
      if (version) {
        return res.redirect(302, `/npm/${pkgName}@${version}`);
      }
    }
    return res.redirect(302, `/npm/${pkgName}@${pkg["dist-tags"].latest}`);
  }
  return res.send("not found");
}
