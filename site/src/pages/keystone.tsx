import { getInfo } from "../extract";
export { Root as default } from "../components/root";

export async function getStaticProps() {
  const pathToKeystone =
    process.env.NODE_ENV === "development" ? "../../keystone" : "../keystone";
  return {
    props: await getInfo({
      tsConfigFilePath: `${pathToKeystone}/tsconfig.json`,
      packagePath: `${pathToKeystone}/packages/keystone`,
    }),
  };
}
