import { GetServerSideProps } from "next";
import { useState } from "react";
import Link from "next/link";
import { GetOutfitsByUser, OutfitItem } from "../../apis/get_outfits";
import { Footer } from "../../components/footer";
import { Modal } from "../../components/modals";
import { Navbar } from "../../components/navarbar";
import { GetImageServerURL, GetServerURL } from "../../apis/get_server";
import { PageMetadata } from "../_app";
import { AccountPromptModal } from "../../components/modals/accountPrompt";
import { OutfitForm } from "../../components/forms/outfit";
import { PostOutfit } from "../../apis/post_outfit";
import { Outfit } from "../../apis/get_outfits";
import { ColorPalette } from "../../components/color/palette";
import { MunsellColors } from "../../apis/get_munsell";
import { RatingDiv } from "../../components/outfit/rating";
import { Slider } from "../../components/base/slider";

type Props = {
  cookie: string;
  error: string | null;
  clientServer: string;
  metadata: PageMetadata;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  let props: Props = {
    cookie: "",
    error: null,
    clientServer: "",

    metadata: {
      title: "Color Analysis",
      description:
        "Start building your virtual closet by posting an outfit and get rewarded for your style. RateYourStyle is an online fashion community for all of your style inspo needs.",
    },
  };

  let cookie = context.req.cookies["rys-login"];
  props.cookie = cookie ? cookie : "";

  let clientServer = GetServerURL(true);
  if (clientServer instanceof Error) {
    props.error = clientServer.message;
    return { props };
  }

  props.clientServer = clientServer;

  return { props };
};

function PostOutfitPage({ cookie, clientServer }: Props) {
  const [value, setValue] = useState(2);
  const [value2, setValue2] = useState(8);
  const [chroma, setChroma] = useState(0);
  return (
    <>
      <Navbar clientServer={clientServer} cookie={cookie} />

      <main className="mt-8 sm:mt-14">
        <section className="mb-4 p-8 md:p-12 bg-gradient text-white">
          <h1 className="text-white">Personal Color Analysis</h1>
        </section>
        <section className="p-8">
          <div className="grid sm:grid-cols-2 gap-8">
            <div>
              <ColorPalette palette="true-summer" />
              <ColorPalette palette="true-winter" />
              <ColorPalette palette="true-autumn" />
              <ColorPalette palette="true-spring" />
            </div>
            <div>
              <h2>Color Theory</h2>
              <p>
                Have you ever noticed that certain clothing colors make you look
                tired and washed out, while others instantly make you look
                stunning? You haven't just imagine this; there is a reason why
                this happens. And it has to do with color theory. <br />
                <br />
                Everyone has a color palette that enhances their natural beauty.
                Discover yours below!
              </p>
            </div>
          </div>
        </section>

        <section className="p-8 itesm-center">
          <h2>How It Works</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <img
              src="/screenshot-6.png"
              className=" border-4 border-black w-1/2"
            />
            <div className="col-span-2">
              {howItWorks.map((item, index) => (
                <div key={`how-it-works-step-${index}`} className="pb-4">
                  <h2 className="pb-2">
                    {index + 1}. {item.title}
                  </h2>
                  <div>{item.content}</div>
                </div>
              ))}
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

        <section className="bg-white p-4 md:p-8">
          <h1>Color Theory</h1>
          <div>
            RateYourStyle uses the Munsell Color System to derive our seasonal
            color palettes.
          </div>

          <Slider
            label="Value"
            value1={value}
            value2={value2}
            onChange1={(e: any) => setValue(Number(e.target.value))}
            onChange2={(e: any) => setValue2(Number(e.target.value))}
          />

          {/* <div className="flex gap-4 items-center">
            <div className="w-fit">
              <label>Your rating</label>
              <input
                id="rating"
                type="range"
                min="0"
                max="10"
                step="2"
                className="h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer  p-0 m-0"
                onChange={(e) => setValue(Number(e.target.value))}
                list="rating"
                value={value}
              />
              <datalist
                className="flex text-primary -mt-2 p-0 justify-between items-start"
                id="rating"
              >
                <option className="text-xs">|</option>
                <option className="text-xs">|</option>
                <option className="text-xs">|</option>
                <option className="text-xs">|</option>
                <option className="text-xs">|</option>
              </datalist>
            </div>
            <h1 className="text-primary">{value}</h1>
          </div> */}

          <div className="flex gap-4 items-center">
            <div className="w-fit">
              <label>Your rating</label>
              <input
                id="rating"
                type="range"
                min="0"
                max="28"
                step="2"
                className="h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer  p-0 m-0"
                onChange={(e) => setChroma(Number(e.target.value))}
                list="rating"
                value={chroma}
              />
              <datalist
                className="flex text-primary -mt-2 p-0 justify-between items-start"
                id="rating"
              >
                <option className="text-xs">|</option>
                <option className="text-xs">|</option>
                <option className="text-xs">|</option>
                <option className="text-xs">|</option>
                <option className="text-xs">|</option>
              </datalist>
            </div>
            <h1 className="text-primary">{chroma}</h1>
          </div>

          <div className="flex w-full flex-wrap">
            {MunsellColors.map((c) => {
              let rgb = `rgb(${c.dR.toString()},${c.dG.toString()},${c.dB.toString()})`;

              if (value <= c.V && c.V <= value2 && c.C === chroma) {
                return (
                  <div
                    style={{ backgroundColor: rgb }}
                    className="border-2 w-8 aspect-square"
                  ></div>
                );
              }
            })}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

const howItWorks = [
  {
    title: "Upload a headshot",
    content: (
      <div>
        Choose a clear picture taken in natural lighting for more accurate
        results.
      </div>
    ),
  },
  {
    picture_url: "/screenshot-5.png",
    title: "Your personal hue, value and chroma",
    content: (
      <div>
        Using your headshot, RateYourStyle will determine the exact hue, value
        and chroma of your skintone, eyes and hair.
      </div>
    ),
    bgcolor: "bg-custom-lime",
  },
  {
    picture_url: "/screenshot-6.png",
    title: "Get Your Palette",
    content: (
      <div>
        Our color algorithms and AI modal will determine the seasonal color
        palette that commpliments you the most.
      </div>
    ),
    bgcolor: "bg-custom-pink",
  },
  {
    title: "Explore Your Colors",
    content: (
      <div>
        Explore your color palette! Easily compare how different colors look on
        you.
      </div>
    ),
  },
];

export default PostOutfitPage;
