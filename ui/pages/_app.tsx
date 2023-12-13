import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Head from "next/head";
import { useRouter } from 'next/router'

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
        <title>{metadata && metadata.title ?  metadata.title + " - Rate Your Style" : "RateYourStyle"}</title>
        <link rel="icon" type="image/x-icon" href="/favicon.ico"></link>
        <meta
          name="description"
          content={
           metadata && metadata.description
              ? metadata.description
              : "Rate Your Style is an online fashion community for all of your style inspo needs. Post outfit pics to get fashion feedback, and give style advice to other users. Find new clothing brands and read reviews about each clothing item. Keep an e-inventory of all of your clothes through our closet table feature."
          }
        />
      </Head>
      <Component {...pageProps} key={router.asPath}/>
    </>
  )
}

export default MyApp
