import { GetServerSideProps } from "next";

import { Footer } from "../components/footer";
import { Navbar } from "../components/navarbar";
import { GetServerURL } from "../apis/get_server";
import { PageMetadata } from "./_app";
import { MunsellColorCharts } from "../components/color/color-charts";

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
  return (
    <>
      <Navbar clientServer={clientServer} />
      <main className="mt-8 sm:mt-14 overflow-y-hidden">
        <section className="mb-4 p-4 md:p-8 bg-gradient ">
          <h1 className="text-white text-2xl">Color Science</h1>
        </section>

        <section className="p-4 md:p-8">
          <h2>Introduction</h2>
          <div>
            Color is one of the first aspects of clothing that we notice,
            whether it's on ourselves or on others. As fundamental to style as
            color is, color science is often not taught due to the highly
            subjective nature of color perception. Indeed, while the physical
            nature of color is scientificaly defined as the range of wavelengths
            along the electromagnetic spectrum the human eye can pereceive, the
            psychological nature is dependent on a number of factors that can
            vary from person to person, including: physiological differences in
            sensory processing, and individual differences in conscious
            experiences and learned adaptions. <br />
            <br />
            Despite the subjective nature of color perception, the following
            tutorials aim to provide a basic foundation of color science
            education. We hope that users find this knowledge useful in their
            can transfer this knowledge to bridge the gap in color science
            education. We hope that with a better understanding of color
            science, users can determine things like personal color analysis to
            help them in their fashion journey.
          </div>
        </section>
        <section className="p-4 md:p-8">
          <h2>1. Dimensions of color </h2>
          <div>
            One of the most widely used color systems in the world is the
            Munsell Color System. Munsell defined a structured approach to color
            perception that closes matches the human visual expereince. He
            categorized colors based on the following elements: 1. Hue 2. Chroma
            3. Value
            <MunsellColorCharts />
          </div>
        </section>
        <section className="p-4 md:p-8"></section>
      </main>

      <Footer />
    </>
  );
}

export default ColorSciencePage;
