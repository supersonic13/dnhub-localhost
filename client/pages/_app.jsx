import "../styles/scrollbar.css";
import "../styles/globals.css";
import { NextUIProvider } from "@nextui-org/react";
import { useEffect } from "react";
import { Provider } from "react-redux";
import store from "../Redux/store";

import Head from "next/head";
import Layout from "../Components/Layout";
function MyApp({ Component, pageProps }) {
  useEffect(() => {
    import("preline");
  }, []);

  return (
    <NextUIProvider>
      <Provider store={store}>
        <Head>
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/images/logo/logo/logo2.png"
          />
        </Head>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </Provider>
    </NextUIProvider>
  );
}

export default MyApp;
