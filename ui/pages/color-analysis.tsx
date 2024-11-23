import { GetServerSideProps } from "next";
import { useState } from "react";
import { Footer } from "../components/footer";
import { Navbar } from "../components/navarbar";
import { GetServerURL, GetImageServerURL } from "../apis/get_server";
import { PageMetadata } from "./_app";
import { PrimaryButton } from "../components/base/buttons/primary";
import { MunsellColorSystem } from "../components/color/color-system";
import { ColorMatchingGame } from "../components/color/color-matching-game";
import { Modal } from "../components/modals";
import { ColorDifferenceGame } from "../components/color/color-difference-game";
import {
  MunsellHueData,
  getAutumnColors,
  getSpringColors,
  getSummerColors,
  getWinterColors,
} from "../apis/get_munselldata";
import { HeadShotForm } from "../components/forms/headshot";

import { ColorDiv, MunsellColorDiv } from "../components/color/color-div";
import { ColorAnalysisForm } from "../components/forms/color-analysis";
type Props = {
  clientServer: string;
  imageServer: string;
  error: string | null;
  metadata: PageMetadata;
  cookie?: string;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  let props: Props = {
    error: null,
    clientServer: "",
    imageServer: "",
    metadata: {
      title: "Color Analysis",
      description:
        "Determine your own personal color analysis. Use your color analysis results to help develop your own personal style.",
    },
    cookie: "",
  };

  const clientServer = GetServerURL(true);
  if (clientServer instanceof Error) {
    props.error = clientServer.message;
    return { props };
  }
  props.clientServer = clientServer;

  const imageServer = GetImageServerURL();
  if (imageServer instanceof Error) {
    props.error = imageServer.message;
    return { props };
  }
  props.imageServer = imageServer;

  if (context.req.cookies["rys-login"]) {
    props.cookie = context.req.cookies["rys-login"];
  }

  return { props };
};

function ColorAnalysisPage({
  clientServer,
  imageServer,
  cookie,
  error,
}: Props) {
  const [imageURL, setImageURL] = useState("");

  return (
    <>
      <Navbar clientServer={clientServer} cookie={cookie} />
      <main className="mt-8 sm:mt-14 overflow-y-hidden">
        <section className="mb-4 p-4 md:p-8 bg-gradient ">
          <h1 className="text-white text-2xl">Color Analysis</h1>
        </section>

        <section className="px-4 py-2 md:px-8 md:py-2">
          <div className="p-6 rounded-lg bg-neutral-100 shadow-sm">
            <h2>Introduction</h2>
            <div>
              Personal color analysis is the process of finding the colors that
              best compliment your natural features. If you've ever noticed that
              certain color-ed clothing or make up "washes you out", it might be
              because you were wearing colors outside of your "season".
              Likewise, if you ever felt like wearing a certain color
              "brightened" your look, it might have been because you were
              wearing colors within your seasonal palette.
              <br />
              <br />
              <span className="font-semibold">
                What are "seasons" in personal color anlaysis?
              </span>
              <br />
              The concept of seasonal colors was introduced in the 1940's by
              Suzanne Caygill who combined color science with psychology. She
              looked at color harmonies found in nature through the seasons, and
              associated them to personalities and fashion styles. Her theory
              inspried Carole Jackson, author of the best-seller "Color Me
              Beautiful", who matured the theory. Jackson believed that everyone
              falls under a specific season according to their natural features:
              Spring, Summer, Autumn and Winter, and created color palettes that
              harmonized well for that season. <br /> <br />
              While the process of finding one's seasonal/personal colors is
              rooted in the general principles of color science, at the end of
              the day, there are no rules or limitation in fashion!
            </div>
          </div>
        </section>

        <section className="px-4 py-2 md:px-8 md:py-2">
          <div className="p-6 rounded-lg bg-neutral-100 shadow-sm">
            <h2>Color Seasons</h2>

            <div className="flex gap-2 flex-wrap">
              <div>
                <h3>Summer</h3>
                <p>
                  This season is characterized by:
                  <ul>
                    <li>Cool hue</li>
                    <li>Light value</li>
                    <li>Muted chroma</li>
                  </ul>
                </p>
              </div>
              <div className="flex w-full flex-wrap ">
                {getSummerColors().map((g) => {
                  return (
                    /* eslint-disable */
                    <div className="flex">
                      <MunsellColorDiv color={g} key={g.file_order} />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              Winter Color
              <div className="flex w-full flex-wrap ">
                {getWinterColors().map((g) => {
                  return (
                    /* eslint-disable */
                    <div className="flex">
                      <MunsellColorDiv color={g} key={g.file_order} />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <div className="flex w-full flex-wrap ">
                {getSpringColors().map((g) => {
                  return (
                    /* eslint-disable */
                    <div className="flex">
                      <MunsellColorDiv color={g} key={g.file_order} />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <div className="flex w-full flex-wrap ">
                {getAutumnColors().map((g) => {
                  return (
                    /* eslint-disable */
                    <div className="flex">
                      <MunsellColorDiv color={g} key={g.file_order} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
        <section className="px-4 py-2 md:px-8 md:py-2">
          <h2>Color Analysis App </h2>
          {!imageURL ? (
            <div className="p-6 rounded-lg bg-neutral-100 shadow-sm sm:w-1/2">
              <HeadShotForm
                imageServer={imageServer}
                cookie={cookie || ""}
                setImageURL={setImageURL}
              />
            </div>
          ) : (
            <div className="p-6 rounded-lg bg-neutral-100 shadow-sm">
              <ColorAnalysisForm imageURL={imageURL} />
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}

export default ColorAnalysisPage;
