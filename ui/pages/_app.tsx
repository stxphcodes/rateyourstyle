import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Head from "next/head";
import { useRouter } from 'next/router'

function MyApp({ Component, pageProps }: AppProps) {
  // See this github issue on how using router helps with 
  // page reloading issue
  // https://github.com/vercel/next.js/discussions/22512#discussioncomment-1779505
  const router = useRouter()

  return (
    <>
      <Head>
        <title>RateYourStyle</title>
        <link rel="icon" type="image/x-icon" href="/rys.png"></link>
      </Head>
      <Component {...pageProps} key={router.asPath}/>
    </>
  )
}

export default MyApp
