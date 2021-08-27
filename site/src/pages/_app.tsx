import { ChakraProvider } from "@chakra-ui/react";
import { AppProps } from "next/app";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <div css={{}}>
        <Component {...pageProps} />
      </div>
    </ChakraProvider>
  );
}
export default MyApp;
