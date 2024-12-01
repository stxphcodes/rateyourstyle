import { GetServerSideProps } from "next";
import { useState } from "react";
import { Footer } from "../components/footer";
import { Navbar } from "../components/navarbar";
import { GetServerURL } from "../apis/get_server";
import { PageMetadata } from "./_app";
import { PrimaryButton } from "../components/base/buttons/primary";
import { MunsellColorSystem } from "../components/color/color-system";
import { ColorMatchingGame } from "../components/color/color-matching-game";
import { Modal } from "../components/modals";
import { ColorDifferenceGame } from "../components/color/color-difference-game";
import { MunsellHueData } from "../apis/get_munselldata";
import {
  LowHighChroma,
  LowHighValue,
  RainbowHues,
} from "../components/color/color-attributes";
type Props = {
  clientServer: string;
  error: string | null;
  metadata: PageMetadata;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  let props: Props = {
    error: null,
    clientServer: "",
    metadata: {
      title: "Color Science",
      description:
        "Learn color science to determine your own personal color analysis. Use your color analysis results to help develop your own personal style.",
    },
  };

  const clientServer = GetServerURL(true);
  if (clientServer instanceof Error) {
    props.error = clientServer.message;
    return { props };
  }
  props.clientServer = clientServer;

  return { props };
};

function ColorSciencePage({ clientServer, error }: Props) {
  const [launchColorMatchGame, setLaunchColorMatchGame] = useState(false);
  const [launchColorDifferenceGame, setLaunchColorDifferenceGame] =
    useState(false);

  return (
    <>
      <Navbar clientServer={clientServer} />
      <main className="mt-8 sm:mt-14 overflow-y-hidden">
        <section className="mb-4 p-4 md:p-8 bg-gradient ">
          <h1 className="text-white text-2xl">Color Science</h1>
        </section>

        <section className="px-4 py-2 md:px-8 md:py-2">
          <div className="p-6 rounded-lg bg-neutral-100 shadow-sm">
            <h2>Introduction</h2>
            <div>
              Color is one of the first aspects of clothing that we notice,
              whether it&apos;s on ourselves or on others. As fundamental to
              style as color is, color science is often not taught due to the
              highly subjective nature of color perception. While the physical
              nature of color is scientificaly defined as the range of
              wavelengths along the electromagnetic spectrum the human eye can
              pereceive, the psychological nature is dependent on a number of
              factors that can vary from person to person, including:
              physiological differences in sensory processing, and individual
              differences in conscious experiences and learned adaptions. <br />
              <br />
              Despite the subjective nature of color perception, the following
              page aims to share very basic knowledge about the dimensions that
              make up color perception. We hope that with this basic knowledge,
              users can better understand things like personal color analysis to
              help them in their fashion journey.
            </div>
          </div>
        </section>
        <section className="px-4 py-2 md:px-8 md:py-2">
          <div className="p-6 rounded-lg bg-neutral-100 shadow-sm">
            <h2>Dimensions of color </h2>
            There are 3 main properties of color that the human eye can detect:
            <ul className="list-decimal list-inside my-2">
              <li className="mb-4">
                <span className="font-bold">Hue</span> which refers to the
                actual color or shade.
                <div className="ml-4">
                  <div className="underline mb-2">Example</div>
                  <div className="flex">
                    <div className="flex gap-2">
                      <RainbowHues />
                    </div>
                  </div>
                </div>
              </li>
              <li className="mb-4">
                <span className="font-bold">Saturation</span> which refers to
                how intense or vivid a color appears.
                <div className="ml-4">
                  <div className="underline mb-2">Example</div>
                  <div className="flex gap-2">
                    <LowHighChroma />
                  </div>
                </div>
              </li>
              <li>
                <span className="font-bold">Brightness</span> which refers to
                the relative lightness or darkness of a particular color, from
                black (no brightness) to white (full brightness)
                <div className="ml-4">
                  <div className="underline mb-2">Example</div>
                  <div className="flex gap-2">
                    <LowHighValue />
                  </div>
                </div>
              </li>
            </ul>
            Over time, scientists and artists have developed color systems in
            order to quantify these properties of color, and to create a
            structured approach to color notation. The color system that our
            tutorials and app are based is the Munsell color system.
          </div>
        </section>
        <section className="px-4 py-2 md:px-8 md:py-2">
          <div className="p-6 rounded-lg bg-neutral-100 shadow-sm">
            <h2>Munsell Color System</h2>
            The Munsell color system arranges color such that all three color
            properites are visually uniform in distance from each other. The
            scale used for each color property is as follows:
            <ul className="list-decimal list-inside my-2">
              <li className="mb-4">
                <span className="font-bold">Hue</span> There are are 5 principle
                Munsell hues: Red, Yellow, Green, Blue, Purple, and 5
                intermediate hues: Yellow-Red, Green-Yellow, Blue-Green,
                Purple-Blue and Red-Purple. Each of these hues are placed at
                equal intervals around a circle (see below).
              </li>
              <li className="mb-4">
                <span className="font-bold">Value (aka Brightness)</span> The
                value scale ranges from 0 (pure black) to 10 (pure white). The
                black, white and grays that occur in between are all considered
                neutral colors because they have no chroma (chroma=0).
              </li>
              <li>
                <span className="font-bold">Chroma (aka Saturation)</span>{" "}
                Munsell defines chroma as the degree departure of the color from
                the neutral color of the same value. The chroma scale ranges
                from 0 (neutral color) to an arbitrary maximum that depends on
                the hue and value. Colors with high reflectivity can have chroma
                as high 30. Most colors have a max chroma of around 20.
              </li>
            </ul>
            <div className="mt-8 mb-4">
              Interact with the hue circle, value scale, and chroma scales to
              see how the dimensions affect the resulting colors.
            </div>
            <MunsellColorSystem />
          </div>
        </section>
        <section className="px-4 py-2 md:px-8 md:py-2">
          <div className="p-6 rounded-lg bg-neutral-100 shadow-sm">
            <h2 className="mb-4">
              {" "}
              Let&apos;s put your knowledge of color dimensions to the test!
            </h2>

            <div className="flex gap-16">
              <div className="w-1/2">
                <h3>Color Matching Game</h3>
                <p className="mt-2 mb-4">
                  How sensitive are your eyes to the color dimensions?
                  <br />
                  In this riveting game, players must generate matching color
                  blocks by adjusting each of the color dimension scales.
                </p>
                <PrimaryButton
                  fitContent={true}
                  styles="p-4"
                  onClick={() => setLaunchColorMatchGame(true)}
                >
                  Launch
                </PrimaryButton>
              </div>
              <div className="w-1/2">
                <h3>Color Difference Game</h3>
                <p className="mt-2 mb-4">
                  How well do you know the differences amongst the color
                  dimnesions?
                  <br /> In this riveting game, players must generate matching
                  color blocks by adjusting each of the color dimension scales.
                </p>
                <PrimaryButton
                  fitContent={true}
                  styles="p-4"
                  onClick={() => setLaunchColorDifferenceGame(true)}
                >
                  Launch
                </PrimaryButton>
              </div>
            </div>
          </div>
        </section>
        {launchColorMatchGame && (
          <Modal
            // wideScreen={true}
            handleClose={() => setLaunchColorMatchGame(false)}
          >
            <ColorMatchingGame />
          </Modal>
        )}

        {launchColorDifferenceGame && (
          <Modal
            // wideScreen={true}
            handleClose={() => setLaunchColorDifferenceGame(false)}
          >
            <ColorDifferenceGame />
          </Modal>
        )}
      </main>

      <Footer />
    </>
  );
}

export default ColorSciencePage;
