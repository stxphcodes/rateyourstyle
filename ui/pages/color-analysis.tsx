import { GetServerSideProps } from "next";
import { useState } from "react";
import { Footer } from "../components/footer";
import { Navbar } from "../components/navarbar";
import { GetServerURL, GetImageServerURL } from "../apis/get_server";
import { PageMetadata } from "./_app";
import { ColorAttributes } from "../components/color/color-attributes";
import {
  getAutumnColors,
  getSpringColors,
  getSummerColors,
  getWinterColors,
} from "../apis/get_munselldata";
import { HeadShotForm } from "../components/forms/headshot";
import { PrimaryButton } from "../components/base/buttons/primary";
import { MunsellColorDiv } from "../components/color/color-div";
import { ColorAnalysisForm } from "../components/forms/color-analysis";
import { Modal } from "../components/modals";

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
  const [launchColorAnalysisApp, setLaunchColorAnalysisApp] = useState(false);

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
              best compliment your natural features. If you've ever felt that
              certain clothing or makeup "washes you out", it might be because
              you were wearing colors outside of your "season". Likewise, if you
              ever felt like certain colors "brightened" your look, you were
              likely wearing colors within your seasonal palette.
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
              the day, there are no rules or limitation in fashion! Wear any
              color that your heart desires ❤️.
            </div>
          </div>
        </section>

        <section className="px-4 py-2 md:px-8 md:py-2">
          <div className="p-6 rounded-lg bg-neutral-100 shadow-sm">
            <h2>Color Seasons</h2>
            <div className="pb-8">
              <h3 className="font-bold">Summer</h3>

              <div className="flex gap-8 mb-4">
                <div className="flex-1">
                  Summer season is characterized by cool colors that are high in
                  value (bright) and low in chroma (muted saturation).
                  <div className="flex w-full flex-wrap h-full">
                    {getSummerColors().map((g) => {
                      return (
                        <MunsellColorDiv
                          color={g}
                          large={true}
                          key={g.file_order}
                          singleLine
                        />
                      );
                    })}
                  </div>
                </div>

                <ColorAttributes coolHue highValue lowChroma />
              </div>
            </div>

            <div className="pb-8">
              <h3 className="font-bold">Spring</h3>

              <div className="flex gap-8 mb-4">
                <div className="flex-1">
                  Srping season is characterized by cool colors that are high in
                  value (bright) and high in chroma (high saturation).
                  <div className="flex w-full flex-wrap h-full">
                    {getSpringColors().map((g) => {
                      return (
                        <MunsellColorDiv
                          color={g}
                          large={true}
                          key={g.file_order}
                          singleLine
                        />
                      );
                    })}
                  </div>
                </div>
                <ColorAttributes coolHue highValue highChroma />
              </div>
            </div>

            <div className="pb-8">
              <h3 className="font-bold">Autumn</h3>
              <div className="flex gap-8 mb-4">
                <div className="flex-1">
                  Autumn season is characterized by warm colors that are low in
                  value (dark) and high in chroma (high saturation).
                  <div className="flex w-full flex-wrap h-full">
                    {getAutumnColors().map((g) => {
                      return (
                        <MunsellColorDiv
                          color={g}
                          large={true}
                          key={g.file_order}
                          singleLine
                        />
                      );
                    })}
                  </div>
                </div>
                <ColorAttributes warmHue lowValue highChroma />
              </div>
            </div>

            <div>
              <h3 className="font-bold">Winter</h3>
              <div className="flex gap-8 mb-4">
                <div className="flex-1">
                  Winter season is characterized by cool colors that are low in
                  value (dark) and high in chroma (high saturation).
                  <div className="flex w-full flex-wrap h-full">
                    {getWinterColors().map((g) => {
                      return (
                        <MunsellColorDiv
                          color={g}
                          large={true}
                          key={g.file_order}
                          singleLine
                        />
                      );
                    })}
                  </div>
                </div>
                <ColorAttributes coolHue lowValue highChroma />
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-2 md:px-8 md:py-2">
          <div className="p-6 rounded-lg bg-neutral-100 shadow-sm">
            <h2>Color Analysis App </h2>
            <div>Ready to discover your personal colors?</div>
            <PrimaryButton
              fitContent={true}
              styles="p-4"
              onClick={() => setLaunchColorAnalysisApp(true)}
            >
              Launch
            </PrimaryButton>
          </div>
        </section>
      </main>

      <Footer />
      {launchColorAnalysisApp && (
        <Modal
          handleClose={() => {
            setImageURL("");
            setLaunchColorAnalysisApp(false);
          }}
        >
          {!imageURL ? (
            <div className="p-6 rounded-lg bg-neutral-100 shadow-sm ">
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
        </Modal>
      )}
    </>
  );
}

export default ColorAnalysisPage;
