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
import { ColorAnalysisForm } from "../../components/forms/color-analysis";
import { PostOutfit } from "../../apis/post_outfit";
import { Outfit } from "../../apis/get_outfits";

type Props = {
  cookie: string;
  error: string | null;
  clientServer: string;
  imageServer: string;
  previousOutfitItems: OutfitItem[];
  metadata: PageMetadata;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  let props: Props = {
    cookie: "",
    error: null,
    clientServer: "",
    imageServer: "",
    previousOutfitItems: [],
    metadata: {
      title: "Color Analysis App",
      description: "",
    },
  };

  let server = GetServerURL();
  if (server instanceof Error) {
    props.error = server.message;
    return { props };
  }

  let cookie = context.req.cookies["rys-login"];
  props.cookie = cookie ? cookie : "";

  if (props.cookie) {
    const outfits = await GetOutfitsByUser(server, props.cookie);
    if (!(outfits instanceof Error)) {
      outfits.map((outfit) => {
        outfit.items.map((item) => {
          props.previousOutfitItems.push(item);
        });
      });
    }

    // filter item duplicates
    props.previousOutfitItems = props.previousOutfitItems.filter(
      (value, index, self) => index === self.findIndex((t) => t.id == value.id)
    );

    // sort previous items by brand, color then description,
    props.previousOutfitItems.sort((a, b) => {
      let aDescription: string = (a.brand + a.description).toLowerCase();
      let bDescription: string = (b.brand + b.description).toLowerCase();
      if (aDescription < bDescription) {
        return -1;
      }
      return 1;
    });
  }

  let clientServer = GetServerURL(true);
  if (clientServer instanceof Error) {
    props.error = clientServer.message;
    return { props };
  }

  props.clientServer = clientServer;

  let imageServer = GetImageServerURL();
  if (imageServer instanceof Error) {
    props.error = imageServer.message;
    return { props };
  }
  props.imageServer = imageServer;

  return { props };
};

function PostOutfitPage({
  cookie,
  clientServer,
  imageServer,
  previousOutfitItems,
  error,
}: Props) {
  const [formSubmissionStatus, setFormSubmissionStatus] = useState("");

  const onSubmit = async (outfit: Outfit) => {
    const resp = await PostOutfit(clientServer, cookie, outfit);
    if (resp instanceof Error) {
      setFormSubmissionStatus("errorOnSubmission");
    } else {
      setFormSubmissionStatus("success");
    }
  };

  return (
    <>
      <Navbar clientServer={clientServer} cookie={cookie} />
      {!cookie && <AccountPromptModal clientServer={clientServer} />}

      <main className="mt-8 sm:mt-14 overflow-y-hidden">
        <section className="mb-4 p-8 md:p-12 bg-gradient text-white">
          <h1 className="text-white">Personal Color Analysis</h1>
        </section>

        <section className="p-8 sm:w-1/2">
          <h1>Step 1. Upload a headshot</h1>
          <ColorAnalysisForm
            clientServer={clientServer}
            imageServer={imageServer}
            cookie={cookie}
            previousItems={previousOutfitItems}
            onSubmit={onSubmit}
          />
        </section>
      </main>

      {formSubmissionStatus == "errorOnSubmission" && (
        <Modal handleClose={() => setFormSubmissionStatus("")}>
          <div>
            <h3>Uh oh 😕 Our servers might be down. </h3> Please try submitting
            the form again when you are able.
            <br />
            If the error persists, please email us at rateyourstyle@gmail.com .
          </div>
        </Modal>
      )}

      {formSubmissionStatus == "success" && (
        <Modal handleClose={() => location.assign("/")}>
          <div>
            <h2>Lookin&apos; chic✨ </h2>
            <p>
              Check out your post on the{" "}
              <Link href="/">
                <a className="text-primary underline">homepage</a>
              </Link>{" "}
              and rate outfits you like!
            </p>
          </div>
        </Modal>
      )}
      <Footer />
    </>
  );
}

export default PostOutfitPage;
