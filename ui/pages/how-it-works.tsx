import { GetServerSideProps } from "next";
import Link from "next/link";
import { Footer } from "../components/footer";
import { Navbar } from "../components/navarbar";
import { GetServerURL } from "../apis/get_server";
import { PageMetadata } from "./_app";

type Props = {
  cookie: string;
  clientServer: string;
  error: string | null;
  metadata: PageMetadata;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  let props: Props = {
    cookie: "",
    error: null,
    clientServer: "",
    metadata: {
      title: "How It Works",
      description:
        "Rate Your Style is a fashion community to support people in finding their personal style. Use Rate Your Style to get outfit feedback and style advice, and to find fashion outfit inspo. You can also connect with professional stylists on Rate Your Style.",
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

  const clientServer = GetServerURL(true);
  if (clientServer instanceof Error) {
    props.error = clientServer.message;
    return { props };
  }
  props.clientServer = clientServer;

  return { props };
};

const howItWorks = [
  {
    picture_url: "/screenshot-1.png",
    title: "1. Create an account",
    bgcolor: "bg-custom-pink",
    content: (
      <div>
        Create an account by hitting the Create an Account button on the top
        left corner of the navbar. Once you&apos;ve logged into your new
        account, head over to your Account page to edit your closet description,
        add links to other social media, and describe your personal style.
      </div>
    ),
  },
  {
    picture_url: "/screenshot-2.png",
    title: "2. Upload your outfits",
    bgcolor: "bg-custom-lime",
    content: (
      <div>
        This is the fun part! Start posting your favorite outfits by going to
        the <a href="">Post Oufit</a> page. Posting an outfit will involve
        submitting a photo of the outfit, writing a general description, and
        ID-ing each item that makes the outfit.
      </div>
    ),
  },
  {
    picture_url: "/screenshot-3.png",
    title: "3. Get outfit feedback",
    content: (
      <div>
        The Rate Your Style community will rate and review your outfits. There
        are professional stylists on Rate Your Style. If you&apos;d like their
        specific outfit feedback, you can send an outfit feedback request to
        them directly.
      </div>
    ),
    bgcolor: "bg-custom-pink sm:bg-custom-lime",
  },
  {
    picture_url: "/screenshot-4.png",
    title: "4. Give outfit feedback",
    content: (
      <div>
        Use the{" "}
        <Link href="/discover" passHref={true}>
          <a className="hover:text-custom-pink">Discover page</a>
        </Link>{" "}
        to find fashion inspo, and to rate & review other users&apos; outfits.
        If other users like your style, they can request feedback from you.
      </div>
    ),
    bgcolor: "bg-custom-lime sm:bg-custom-pink",
  },
];

function HowItWorks({ cookie, clientServer }: Props) {
  return (
    <>
      <Navbar clientServer={clientServer} cookie={cookie} />
      <main className="mt-12 sm:mt-20">
        <section className="px-4 md:px-8">
          <h1>How It Works</h1>
          <div className="my-4">
            As a platform, Rate Your Style is free to join and use. However, if
            you&apos;d like specific style feedback or fashion help from
            professional stylists that are on the platform, they may charge a
            fee.
          </div>
        </section>
        <section>
          <div className="grid md:grid-cols-2">
            {howItWorks.map((item, index) => (
              <div
                className={`p-8 whitespace-pre-line ${item.bgcolor}`}
                key={`how-it-works-step-${index}`}
              >
                <div className="grid grid-cols-2 gap-4 items-start mt-4">
                  <div className="col-span-1 ">
                    <h2 className="pb-4">{item.title}</h2>

                    {item.content}
                  </div>
                  <img
                    alt={`how-it-works-img-${index}`}
                    src={item.picture_url}
                    className=" border-4 border-black"
                  ></img>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="px-4 md:px-8 py-8">
          <h1 className="pb-2">Questions?</h1>
          Feel free to contact sitesbystephanie@gmail.com if you have any
          questions about how the platforms works.
          <br />
          If you are a personal stylist, personal shopper or wardrobe
          consultant, I would love to set up a call to describe more how RYS
          might help you. Please contact sitesbystephanie@gmail.com
        </section>
      </main>
      <Footer />
    </>
  );
}

export default HowItWorks;
