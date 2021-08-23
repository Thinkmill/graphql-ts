import { getPackage } from "../../extract/from-npm";
import { GetStaticPropsContext, GetStaticPathsResult } from "next";

export { Root as default } from "../../components/root";

export function getStaticPaths(): GetStaticPathsResult {
  return { paths: [], fallback: "blocking" };
}

export async function getStaticProps({ params }: GetStaticPropsContext) {
  const query: string = (params as any).pkg.join("/");
  const [, pkgName, version] = query.match(/^(@?[^@]+)(?:@(.+))?/)!;
  const props = await getPackage(pkgName, version);
  return {
    props,
  };
}
