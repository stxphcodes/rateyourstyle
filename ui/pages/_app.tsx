import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Head from "next/head";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>RateYourStyle</title>
        <link rel="icon" type="image/x-icon" href="/rys.png"></link>
      </Head>
      <Component {...pageProps} />
    </>
  )
}

export default MyApp
