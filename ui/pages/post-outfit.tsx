import { GetServerSideProps } from "next";
import { useState } from "react";
import Link from "next/link";
import { GetOutfitsByUser, OutfitItem } from "../apis/get_outfits";
import { Footer } from "../components/footer";
import { Modal } from "../components/modals";
import { Navbar } from "../components/navarbar";
import { GetImageServerURL, GetServerURL } from "../apis/get_server";
import { PageMetadata } from "./_app";
import { AccountPromptModal } from "../components/modals/accountPrompt";
import { OutfitForm } from "../components/forms/outfit";
import { PostOutfit } from "../apis/post_outfit";
import { Outfit } from "../apis/get_outfits";

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
      title: "Post Outfit",
      description:
        "Start building your virtual closet by posting an outfit and get rewarded for your style. Rate Your Style is an online fashion community for all of your style inspo needs.",
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

      <main className="mt-12 sm:mt-20 px-4 md:px-8 w-full md:w-3/4">
        <section className="mb-4">
          <div className="bg-custom-tan p-2 rounded">
            <h3>FAQs</h3>
            <div className="font-semibold mt-2">
              Who can see my outfit posts?
            </div>
            <p>
              Each outfit post has its own privacy setting. Private posts do{" "}
              <span className="underline">not</span> appear on the homepage and
              are not discoverable by the general public. The post is only
              visible to you, the creator of the post, when you log into your
              account.
            </p>
            <div className="font-semibold mt-2">
              What outfit items should I include?
            </div>
            <p>
              You can include anything you&apos;re wearing! For example,
              accessories, shoes, bags, shirts, jackets are all considered one
              item each.
            </p>
            <div className="font-semibold mt-2">
              What should I include in the item review?
            </div>
            <p>
              You can write about the item&apos;s fit, material quality and
              whether you would recommend the item. The item review and rating
              system is a great way to decide whether you want to keep something
              in your closet in the future, so try to be honest about how you
              feel!
            </p>
            <div className="font-semibold mt-2">
              How does Rate Your Style generate my outfit items?
            </div>
            <p>
              Rate Your Style uses Open AI&apos;s gpt4o model to find and
              describe items in your outfit.
            </p>
          </div>
        </section>

        <section className="my-8">
          <h1>Outfit Post</h1>
          <OutfitForm
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
            If the error persists, please email us at sitesbystephanie@gmail.com
            .
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
