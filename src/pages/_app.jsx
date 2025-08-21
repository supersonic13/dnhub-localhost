import "../styles/scrollbar.css";
import "../styles/globals.css";
import { HeroUIProvider } from "@heroui/react";
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
    <HeroUIProvider>
      <Provider store={store}>
        <Head>
          <title>dnhub.io Local Host Server</title>
          <meta
            name="description"
            content="dnhub.io local host server"
          />
          {/* <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/images/logo/logo/logo2.png"
          />*/}
        </Head>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </Provider>
    </HeroUIProvider>
  );
}

export default MyApp;
