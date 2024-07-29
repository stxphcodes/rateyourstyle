import { GetServerSideProps } from "next";
import { Footer } from "../components/footer";
import { Navbar } from "../components/navarbar";
import { GetServerURL, GetAuthServerURL } from "../apis/get_server";
import { PageMetadata } from "./_app";
import SignupForm from "../components/forms/signup";
import { GoogleButton } from "../components/base/buttons/google";
import Link from "next/link";

type Props = {
  clientServer: string;
  authServer: string;
  error: string | null;
  metadata: PageMetadata;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  let props: Props = {
    error: null,
    authServer: "",
    clientServer: "",
    metadata: {
      title: "Sign Up",
      description:
        "Rate Your Style is a fashion community to support people in finding their personal style. Use Rate Your Style to get outfit feedback and style advice, and to find fashion outfit inspo. You can also connect with professional stylists on Rate Your Style.",
    },
  };

  if (context.req.cookies["rys-login"]) {
    return {
      redirect: {
        destination: "/discover",
        permanent: false,
      },
    };
  }

  const clientServer = GetServerURL(true);
  if (clientServer instanceof Error) {
    props.error = clientServer.message;
    return { props };
  }
  props.clientServer = clientServer;

  const authServer = GetAuthServerURL();
  if (authServer instanceof Error) {
    props.error = authServer.message;
    return { props };
  }
  props.authServer = authServer;

  return { props };
};

function Signup({ clientServer, authServer, error }: Props) {
  if (error) {
    return <div>error {error} </div>;
  }

  return (
    <>
      <Navbar clientServer={clientServer} />
      <main className="">
        <section className="p-4 md:p-8 mt-8   bg-gradient">
          <div className="md:w-1/2 m-auto pt-8">
            <div className="p-8 shadow-lg rounded-lg bg-white">
              <div className="text-center">
                <div className="py-4">
                  <h2 className=" ">Join Rate Your Style</h2>
                  <p>
                    A fashion community to support you in finding your personal
                    style 🫶.
                  </p>
                </div>

                {/* <form
                  action="http://localhost:8003/auth/google/signin"
                  method="get"
                >
                  <GoogleButton styles="m-auto" />
                </form>

                <div className="inline-flex items-center justify-center w-full">
                  <hr className="w-64 h-px my-8 bg-black border-0 " />
                  <span className="absolute px-3 font-medium text-gray-900 -translate-x-1/2 bg-white left-1/2 dark:text-white dark:bg-gray-900">
                    or
                  </span>
                </div> */}
              </div>

              <SignupForm clientServer={clientServer} authServer={authServer} />
            </div>

            <div className="pt-4">
              Have an account? <Link href="/signin">Sign in</Link> instead.
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default Signup;
