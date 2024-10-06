import { GetServerSideProps } from "next";
import { useState, useEffect } from "react";
import Link from "next/link";

import { Footer } from "../components/footer";
import { Navbar } from "../components/navarbar";
import { GetAuthServerURL, GetServerURL } from "../apis/get_server";
import { PageMetadata } from "./_app";
import { PasswordSigninForm } from "../components/forms/signin-password";
import { ChevronLeftIcon } from "../components/icons/chevron-left";
import { OTPForm } from "../components/forms/signin-otp";

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
      title: "Sign In",
      description:
        "RateYourStyle is a fashion community to support people in finding their personal style. Use RateYourStyle to get outfit feedback and style advice, and to find fashion outfit inspo. You can also connect with professional stylists on RateYourStyle.",
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

function Signin({ authServer, clientServer, error }: Props) {
  const [option, setOption] = useState("");

  const handleOptionClick = (event: any) => {
    event.preventDefault();

    if (event && event.target && event.target.id) {
      setOption(event.target.id);
    }
  };

  if (error) {
    return <div>error {error} </div>;
  }

  return (
    <>
      <Navbar clientServer={clientServer} />
      <main className="p-4 md:p-8 mt-8  bg-gradient ">
        <div className="md:w-1/2 m-auto py-12">
          <div className="p-8 shadow-lg rounded-lg bg-white">
            <div className="py-8 text-center">
              <h2 className="">Sign in to RateYourStyle</h2>
              <h3>Welcome back!</h3>

              <img
                src="/henry_2.jpeg"
                className="mt-4 w-3/4 md:w-1/3 object-contain m-auto rounded-lg"
              />
            </div>
            {!option ? (
              <SigninOptionScreen
                authServer={authServer}
                handleClick={handleOptionClick}
              />
            ) : (
              <div
                className="flex gap-2 items-center mb-8 text-sm hover:cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  setOption("");
                }}
              >
                <ChevronLeftIcon />
                Go back
              </div>
            )}

            {option === "password" && (
              <UsernamePasswordScreen
                authServer={authServer}
                handleClick={handleOptionClick}
              />
            )}
            {option === "otp" && (
              <OneTimePasswordScreen authServer={authServer} />
            )}
          </div>

          <div className="pt-4 text-white">
            Don&apos;t have an account? <Link href="/signup">Sign up</Link>{" "}
            instead.
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

const SigninOptionScreen = (props: {
  authServer: string;
  handleClick: any;
}) => {
  const buttonStyle =
    "border w-full text-black shadow rounded-lg py-2 my-4 px-4";
  return (
    <div className="w-full">
      {/* <form
        className="my-4"
        action={`${props.authServer}/auth/signin/sso`}
        method="get"
      >
        <GoogleButton styles="w-full" label="Sign in with Google" />
      </form> */}
      <button id="otp" onClick={props.handleClick} className={buttonStyle}>
        Sign in with a one time password
      </button>
      <button id="password" onClick={props.handleClick} className={buttonStyle}>
        Sign in with your username and password
      </button>
    </div>
  );
};

const UsernamePasswordScreen = (props: {
  authServer: string;
  handleClick: any;
}) => {
  return (
    <>
      <PasswordSigninForm authServer={props.authServer} />
      <div className="pt-4">
        <a id="otp" onClick={props.handleClick}>
          Forgot password?
        </a>
      </div>
    </>
  );
};

const OneTimePasswordScreen = (props: { authServer: string }) => {
  return <OTPForm authServer={props.authServer} />;
};

export default Signin;
