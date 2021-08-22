import { getInfo } from "../extract";
export { Root as default } from "../components/root";

export async function getStaticProps() {
  return {
    props: await getInfo({
      tsConfigFilePath: "../tsconfig.json",
      packagePath: "../packages/schema",
    }),
  };
}
