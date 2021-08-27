import { getPackage } from "../../extract/from-npm";
import {
  GetStaticPropsContext,
  GetStaticPathsResult,
  InferGetStaticPropsType,
} from "next";
import * as semver from "semver";
import packageJson, { PackageNotFoundError } from "package-json";

import { Root } from "../../components/root";
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Npm(
  props: InferGetStaticPropsType<typeof getStaticProps>
) {
  const router = useRouter();
  useEffect(() => {
    if (props.kind === "redirect") {
      router.push(props.to);
    }
  }, [props, router]);
  if (props.kind === "redirect") {
    return "Loading...";
  }
  if (props.kind === "not-found") {
    return "This package does not exist";
  }
  return <Root {...props} />;
}

export function getStaticPaths(): GetStaticPathsResult {
  return { paths: [], fallback: "blocking" };
}

export async function getStaticProps({ params }: GetStaticPropsContext) {
  const query: string = (params as any).pkg.join("/");
  const [, pkgName, specifier] = query.match(/^(@?[^@]+)(?:@(.+))?/)!;
  try {
    if (!specifier || !semver.parse(specifier)) {
      const pkg = await packageJson(pkgName, { allVersions: true });
      if (Object.prototype.hasOwnProperty.call(pkg["dist-tags"], specifier)) {
        return {
          props: {
            kind: "redirect" as const,
            to: `/npm/${pkgName}@${pkg["dist-tags"][specifier]}`,
          },
        };
      }
      if (semver.validRange(specifier)) {
        const version = semver.maxSatisfying(
          Object.keys(pkg.versions),
          specifier
        );
        if (version) {
          return {
            props: {
              kind: "redirect" as const,
              to: `/npm/${pkgName}@${version}`,
            },
          };
        }
      }
      return {
        props: {
          kind: "redirect" as const,
          to: `/npm/${pkgName}@${pkg["dist-tags"].latest}`,
        },
      };
    }

    const props = await getPackage(pkgName, specifier);
    return {
      props: { ...props, kind: "package" as const },
    };
  } catch (err) {
    if (err instanceof PackageNotFoundError) {
      return { props: { kind: "not-found" as const } };
    }
    throw err;
  }
}
