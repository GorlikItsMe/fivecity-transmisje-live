import type { AppProps } from "next/app";
import Script from "next/script";
import "../styles/globals.css";
import "@fortawesome/fontawesome-free/css/all.css";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "G-HWN1F3Q20K";

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      {/* Global Site Tag (gtag.js) - Google Analytics */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
      {/* Matomo */}
      <Script
        id="unicorn"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
        var _paq = window._paq = window._paq || [];
        _paq.push(['trackPageView']);
        _paq.push(['enableLinkTracking']);
        (function() {
          var u="https://unicorn.gorlik.pl/";
          _paq.push(['setTrackerUrl', u+'rainbow.php']);
          _paq.push(['setSiteId', '2']);
          var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
          g.async=true; g.src=u+'unicorn5.js'; s.parentNode.insertBefore(g,s);
        })();
        `,
        }}
      />
      <Component {...pageProps} />
    </>
  );
};

export default App;
