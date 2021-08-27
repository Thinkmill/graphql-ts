import { AppProps } from "next/app";
import { themeClass, rootStyles } from "../lib/theme.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div css={{}} className={`${themeClass} ${rootStyles}`}>
      <Component {...pageProps} />
    </div>
  );
}
export default MyApp;
