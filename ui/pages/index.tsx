import { GetServerSideProps } from "next";
import { useState, useEffect } from "react";
import Link from "next/link";

import {
  GetOutfits,
  GetPublicOutfitsByUser,
  Outfit,
  OutfitItem,
} from "../apis/get_outfits";
import { Footer } from "../components/footer";
import { Navbar } from "../components/navarbar";
import { OutfitCard } from "../components/outfit/card";
import { GetServerURL } from "../apis/get_server";
import { PageMetadata } from "./_app";
import { CircleCheckIcon } from "../components/icons/circle-check";

const personalStylistList = [
  "Connect with new clients",
  "Get paid for outfit reviews and consultations",
  "Improve SEO for your styling business",
];

const fashionEnthusiastList = [
  "Document your favorite outfits",
  "Build your virtual closet",
  "Get style advice from real people or pay to get styling advice from a professional stylist",
];

type Props = {
  cookie: string;
  clientServer: string;
  error: string | null;
  outfits: Outfit[] | null;
  metadata: PageMetadata;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  let props: Props = {
    cookie: "",
    error: null,
    outfits: null,
    clientServer: "",
    metadata: {
      title: "",
      description:
        "RateYourStyle is a fashion community to support people in finding their personal style. Use RateYourStyle to get outfit feedback and style advice, and to find fashion outfit inspo. You can also connect with professional stylists on RateYourStyle.",
    },
  };

  let server = GetServerURL();
  if (server instanceof Error) {
    props.error = server.message;
    return { props };
  }

  if (context.req.cookies["rys-login"]) {
    props.cookie = context.req.cookies["rys-login"];
  }

  const outfitResp = await GetOutfits(server, 8);
  if (outfitResp instanceof Error) {
    props.error = outfitResp.message;
    return { props };
  }
  props.outfits = outfitResp;

  const clientServer = GetServerURL(true);
  if (clientServer instanceof Error) {
    props.error = clientServer.message;
    return { props };
  }
  props.clientServer = clientServer;

  return { props };
};

function Home({ cookie, outfits, clientServer, error }: Props) {
  const [heroSectionOutfit, setHeroSectionOutfit] = useState(
    outfits ? outfits[0] : null
  );
  const [heroSectionOutfit2, setHeroSectionOutfit2] = useState(
    outfits ? outfits[1] : null
  );

  const [readMore, setReadMore] = useState(false);

  useEffect(() => {
    let id = setInterval(() => {
      if (outfits) {
        let num = Math.floor(Math.random() * outfits.length);
        let num2 = Math.floor(Math.random() * outfits.length);

        if (num !== num2) {
          setHeroSectionOutfit(outfits[num]);
          setHeroSectionOutfit2(outfits[num2]);
        }
      }
    }, 3000);

    return () => clearInterval(id);
  }, []);

  if (error) {
    return <div>error {error} </div>;
  }

  return (
    <>
      <Navbar clientServer={clientServer} cookie={cookie} />
      <main className="">
        <section className="p-4 md:p-8 bg-gradient mt-8">
          <h1 className="text-4xl text-center pt-8">
            Welcome to RateYourStyle
          </h1>
          <h2 className="text-center uppercase pb-8  m-auto">
            a fashion community to help you find your personal style 🫶
          </h2>

          <div className="sm:w-3/4 m-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-4">
              {heroSectionOutfit && (
                <OutfitCard
                  cookie={cookie}
                  data={heroSectionOutfit}
                  userRating={null}
                  clientServer={clientServer}
                  verifiedBusiness={false}
                />
              )}
              {heroSectionOutfit2 && (
                <div className="hidden sm:block">
                  <OutfitCard
                    cookie={cookie}
                    data={heroSectionOutfit2}
                    userRating={null}
                    clientServer={clientServer}
                    verifiedBusiness={false}
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="p-4 md:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-8">
            <div>
              <h1>For Personal Stylists</h1>
              <h5 className="my-4">
                RateYourStyle is a marketplace that connects people seeking
                fashion advice to personal stylists.
              </h5>
              <ul className="text-lg">
                {personalStylistList.map((item, index) => (
                  <li
                    key={`personal-stylist-reason-${index}`}
                    className="flex gap-2 items-center mb-4"
                  >
                    <div className="flex-none">
                      <CircleCheckIcon />
                    </div>
                    <div className="flex-none">{item}</div>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h1>For Fashion Enthusiasts</h1>
              <h5 className="my-4">
                RateYourStyle is an online community for anyone interested in
                fashion.
              </h5>
              <ul className="text-lg">
                {fashionEnthusiastList.map((item, index) => (
                  <li
                    key={`fashion-enthusiast-reason-${index}`}
                    className="flex gap-2 items-center mb-4 flex-none"
                  >
                    <div className="shrink-0">
                      <CircleCheckIcon />
                    </div>

                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex justify-center my-4">
            <Link href="/how-it-works" passHref={true}>
              <a className="uppercase bg-custom-lime py-2 px-16 rounded hover:bg-custom-pink">
                <h2>How it works</h2>
              </a>
            </Link>
          </div>
        </section>

        <section className="bg-custom-tan">
          <div className="grid sm:grid-cols-2 gap-2">
            <div className="col-span-1 px-4 md:px-8 py-4 text-balance">
              <h1 className="pb-2 animate-typing overflow-hidden whitespace-nowrap">
                Hello World!
              </h1>
              Growing up, one of my favorite past times was shopping and
              dressing up with my mom. We would spend our weekends pillaging the
              sale section of department stores, looking for deals on pieces
              that we felt beautiful in.
              <br />
              {readMore && (
                <>
                  <br />
                  Somewhere in between those blissful, weekend shopping trips as
                  a kid, and the tumultous years of adolscence when my self
                  awareness heightened and my self confidence dropped, I stopped
                  enjoying shopping, and I struggled to feel good in anything
                  that I wore.
                  <br />
                  <br />
                  This continued for most of my early twenties. I remember
                  visiting home during the holidays, and turning down my
                  mom&apos;s invitations to go shopping, which I knew were also
                  invitations to bond and reconnect.
                  <br />
                  <br />
                  It wasn&apos;t until my mid twenties, when I started to
                  understand and accept who I was, that I rediscovered my love
                  for shopping and putting together outfits. Around that time, I
                  also learned about personal style, and I found that defining
                  my personal style helped make shopping less overwhelming, and
                  made getting ready everyday easier and fun again. <br />{" "}
                  <br />
                  So as a software engineer, I wanted to try creating a platform
                  that helps other people in their journey to find their
                  personal style too. Everyone deserves to feel good in what
                  they wear, and who they are. I hope that RateYourStyle can
                  help you achieve that.
                  <br />
                  <br />
                  With love, <br />
                  Steph
                </>
              )}
              <br />
              <a onClick={() => setReadMore(!readMore)}>
                Read {readMore ? "less" : "more"}
              </a>
            </div>

            <div>
              <img
                src="./mom-and-me.jpeg"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </section>

        <section className="bg-white p-4 md:p-8">
          <h1 className="mb-4">Privacy</h1>
          <div>
            We want to be transparent with our visitors and users. Here&apos;s
            what you need to know about how we use the data gatherered on our
            platform:
            <ul className="list-decimal list-inside">
              <li className="py-2">
                RateYourStyle uses cookies to maintain your login session. The
                cookie is only used for the prupose of saving your login
                details.
              </li>
              <li className="pb-2">
                {" "}
                Each outfit post has its own visibility setting and your closet
                will only display clothing items from public outfit posts.
                Private outfits and its clothing items can only be viewed by
                you.
              </li>
              <li>
                RateYourStyle uses Aritifical Intelligence (AI) to enhance your
                experience. AI is used during the outfit posting process to help
                our users identify and describe outfit items.
              </li>
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default Home;
