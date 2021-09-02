import { PackageSearch } from "../components/package-search";

export default function Index() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        marginTop: 240,
      }}
    >
      <div style={{ maxWidth: 600, flex: 1 }}>
        <PackageSearch />
      </div>
    </div>
  );
}
