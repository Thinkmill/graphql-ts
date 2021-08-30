import { getPackage } from "../../extract/from-npm";
import {
  GetStaticPropsContext,
  GetStaticPathsResult,
  InferGetStaticPropsType,
} from "next";
import * as semver from "semver";

import { Root } from "../../components/root";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { resolveToPackageVersion } from "../../extract/utils";
import {
  getPackageMetadata,
  PackageNotFoundError,
} from "../../extract/fetch-package-metadata";

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
      const pkg = await getPackageMetadata(pkgName);
      const version = resolveToPackageVersion(pkg, specifier);
      return {
        props: { kind: "redirect" as const, to: `/npm/${pkgName}@${version}` },
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
