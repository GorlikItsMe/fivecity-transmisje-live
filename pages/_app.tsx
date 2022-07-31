import type { AppProps } from "next/app";
import Script from "next/script";
import "../styles/globals.css";

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      {/* Global Site Tag (gtag.js) - Google Analytics */}
      {/* <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      /> */}
      <Script src="https://embed.twitch.tv/embed/v1.js" />
      <Component {...pageProps} />
    </>
  );
};

export default App;
