import { getPackage } from "../../extract/from-npm";
import {
  GetStaticPropsContext,
  GetStaticPathsResult,
  InferGetStaticPropsType,
} from "next";
import * as semver from "semver";

import { Root } from "../../components/root";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { resolveToPackageVersion } from "../../extract/utils";
import {
  getPackageMetadata,
  PackageNotFoundError,
} from "../../extract/fetch-package-metadata";
import { compressToUTF16, decompressFromUTF16 } from "lz-string";
import { DocInfo } from "../../extract";

export default function Npm(
  _props: InferGetStaticPropsType<typeof getStaticProps>
) {
  const props = useMemo(() => {
    if (_props.kind === "package") {
      if (typeof _props.data === "object") {
        return { kind: "package" as const, data: _props.data };
      }
      const decompressed = decompressFromUTF16(_props.data);
      if (decompressed === null) {
        throw new Error("decompression failed");
      }
      return {
        kind: "package" as const,
        data: JSON.parse(decompressed) as DocInfo,
      };
    }
    return _props;
  }, [_props]);
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
  return <Root {...props.data} />;
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

    let data: DocInfo | string = await getPackage(pkgName, specifier);
    const stringified = JSON.stringify(data);
    // you might be thinking: why are you compressing this?
    // it's just gonna result in a larger size when it's eventually gzipped
    // yes! you are correct!
    // but Lambda has a limit of 6MB on the request and response
    // (i'm pretty sure that's as in both combined can't exceed 6MB)
    // https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html
    // and the size of the generated results of some packages can exceed that
    // so for large packages things, we compress it before it leaves the Lambda
    // which does indeed result in a larger payload over the wire
    // but means that it packages will have to be _even_ larger for this to fail

    if (stringified.length > 1000000) {
      data = compressToUTF16(stringified);
    }
    return {
      props: {
        data,
        kind: "package" as const,
      },
    };
  } catch (err) {
    if (err instanceof PackageNotFoundError) {
      return { props: { kind: "not-found" as const } };
    }
    throw err;
  }
}
