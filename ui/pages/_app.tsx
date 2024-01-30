import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Head from "next/head";
import { useRouter } from 'next/router'
import Script from 'next/script';

export type PageMetadata = {
  title: string;
  description: string;
};

function MyApp({ Component, pageProps }: AppProps<any>) {
  // See this github issue on how using router helps with 
  // page reloading issue
  // https://github.com/vercel/next.js/discussions/22512#discussioncomment-1779505
  const router = useRouter();
  let metadata = pageProps.metadata;

  return (
    <>
      <Head>
        <title>{metadata && metadata.title ? metadata.title + " - Rate Your Style" : "RateYourStyle"}</title>
        <link rel="icon" type="image/x-icon" href="/favicon.ico"></link>
        <meta
          name="description"
          content={
            metadata && metadata.description
              ? metadata.description
              : "Get style feedback on Rate Your Style through outfit reviews and keep track of the clothes you wear through our virtual closet, a database-like table that takes inventory of your clothes and uses data science to create graphs about your closet."
          }
        />
      </Head>
      {/* https://nextjs.org/docs/messages/next-script-for-ga */}
      {process.env.NODE_ENV !== "development" && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=G-TKWD2G1RP9`}
            strategy="afterInteractive"
          ></Script>
          <Script id="google-analytics" strategy="afterInteractive">
            {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-TKWD2G1RP9', {
            page_path: window.location.pathname,
          });
        `}
          </Script>
        </>
      )
      }
      <Component {...pageProps} key={router.asPath} />
    </>
  )
}

export default MyApp
