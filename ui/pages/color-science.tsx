import { GetServerSideProps } from "next";
import { useState } from "react";
import { Footer } from "../components/footer";
import { Navbar } from "../components/navarbar";
import { GetServerURL } from "../apis/get_server";
import { PageMetadata } from "./_app";
import { PrimaryButton } from "../components/base/buttons/primary";
import { MunsellColorCharts } from "../components/color/color-charts";
import { ColorMatchingGame } from "../components/color/color-matching-game";
import { Modal } from "../components/modals";
import { ColorDifferenceGame } from "../components/color/color-difference-game";
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

        <section className="p-4 md:p-8">
          <div className="p-6 rounded-lg bg-neutral-200 shadow-sm">
            <h2>Introduction</h2>
            <div>
              Color is one of the first aspects of clothing that we notice,
              whether it's on ourselves or on others. As fundamental to style as
              color is, color science is often not taught due to the highly
              subjective nature of color perception. Indeed, while the physical
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
        <section className="p-4 md:p-8">
          <h2>1. Dimensions of color </h2>
          <div>
            There are 3 main properties of color that the human eye can detect:
            <ul className="list-decimal list-inside my-2">
              <li>
                <span className="font-bold">Hue</span> which refers to the
                actual color or shade.
              </li>
              <li>
                <span className="font-bold">Saturation</span> which refers to
                how intense or vivid a color appears
              </li>
              <li>
                <span className="font-bold">Brightness</span> which refers to
                the relative lightness or darkness of a particular color, from
                black (no brightness) to white (full brightness)
              </li>
            </ul>
            Over time, scientists and artists have developed color systems in
            order to quantify these properties of color, and to create a
            structured approach to color notation. The color system that our
            tutorials and app are based is the Munsell color system, but other
            color systems include ___, and ___.
            <br />
            <br />
            <h4 className="font-bold">Munsell Color System</h4>
            The Munsell color system arranges color such that all three color
            properites are visually uniform in distance from each other. The
            scales used for each color property is as follows:
            <ul className="list-decimal list-inside my-2">
              <li>
                <span className="font-bold">Hue</span> There are 10 Munsell Hues
                that are placed in equal intervals around a circle. There are 5
                principle Munsell hues - red, yellow, green, blue, and purple,
                and 5 itermediate hues - yellow-red, green-yellow, blue-green,
                purple-blue and red-purple.. For simplicity, the hues are
                referred to by the intials: R, YR, Y, GY, G, BG, B, PB, P, and
                RP.
              </li>
              <li>
                <span className="font-bold">Chroma (aka Saturation)</span>{" "}
                Chroma is along the X-axis, and its scale ranges from 0 (neutral
                color) to an arbitrary maximum that depends on the hue and
                value.
              </li>
              <li>
                <span className="font-bold">Value (aka Brightness)</span> value
                is along with Y-axis, and its scale ranges from 0 (pure black)
                to 10 (pure white)
              </li>
            </ul>
          </div>
          <MunsellColorCharts />
        </section>
        <section className="p-4 md:p-8">
          <h2>Train your color sensitivity</h2>
          <div className="flex ">
            <div className="w-1/2">
              <h4>Color Matching Game</h4>
              <PrimaryButton
                fitContent={true}
                styles="p-4"
                onClick={() => setLaunchColorMatchGame(true)}
              >
                Launch
              </PrimaryButton>
            </div>
            <div className="w-1/2">
              <h4>Color Difference Game</h4>
              <p>
                How well do you know the differences amongst the color
                dimnesions?
                <br /> Play this game to find out!
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
