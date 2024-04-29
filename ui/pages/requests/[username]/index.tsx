import { GetServerSideProps } from "next";
import Link from "next/link";
import { useState, useMemo } from "react";

import {
  GetOutfitsByUser,
  Outfit,
  OutfitItem,
} from "../../../apis/get_outfits";
import { GetRatings, Rating } from "../../../apis/get_ratings";
import { GetUser, User } from "../../../apis/get_user";
import { Navbar } from "../../../components/navarbar";
import { GetServerURL } from "../../../apis/get_server";
import { ClosetTable } from "../../../components/closet/table";
import { Footer } from "../../../components/footer";
import { UserProfileForm } from "../../../components/forms/user-profile";
import { UserGeneralForm } from "../../../components/forms/user-general";
import {
  GetFeedbackRequest,
  GetFeedbackResponse,
} from "../../../apis/get_feedbackrequest";

type Props = {
  cookie: string;
  user: User;
  error: string | null;
  outgoing_requests: GetFeedbackResponse[];
  clientServer: string;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  let props: Props = {
    clientServer: "",
    cookie: "",
    user: {
      username: "",
      email: "",
      user_profile: {
        age_range: "",
        department: "",
        weight_range: "",
        height_range: "",
      },
      user_general: {
        description: "",
        aesthetics: [],
        links: [],
        country: "",
      },
    },
    error: null,
    outgoing_requests: [],
  };

  const clientServer = GetServerURL(true);
  if (clientServer instanceof Error) {
    props.error = clientServer.message;
    return { props };
  }
  props.clientServer = clientServer;

  let server = GetServerURL();
  if (server instanceof Error) {
    props.error = server.message;
    return { props };
  }

  let cookie = context.req.cookies["rys-login"];
  props.cookie = cookie ? cookie : "";

  if (cookie) {
    let username = context.query["username"];
    if (typeof username !== "string") {
      props.error = "missing username for closet";
      return { props };
    }

    const userResp = await GetUser(server, cookie);
    if (userResp instanceof Error) {
      props.error = userResp.message;
      return { props };
    }
    if (userResp.username !== username) {
      props.error = "forbidden";
      return { props };
    }

    props.user = userResp;
  }

  const resp = await GetFeedbackRequest(server, props.cookie);
  if (resp instanceof Error) {
    props.error = resp.message;
    return { props };
  }
  props.outgoing_requests = resp;

  return { props };
};

export default function Index({
  clientServer,
  cookie,
  user,
  outgoing_requests,
  error,
}: Props) {
  if (error) {
    if (error == "forbidden") {
      return (
        <>
          <Navbar clientServer={clientServer} cookie={cookie} />
          <main className="mt-12 sm:mt-20 px-4 md:px-8">
            <h1>✋ Forbidden </h1>
            Please sign in as the user to view their posts.
          </main>
        </>
      );
    }

    return (
      <>
        <Navbar clientServer={clientServer} cookie={cookie} />
        <main className="mt-12 sm:mt-20 px-4 md:px-8">
          <h1>😕 Oh no</h1>
          Looks like there&apos;s an error on our end. Please refresh the page
          in a few minutes. If the issue persists, please email
          sitesbystephanie@gmail.com.
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar
        clientServer={clientServer}
        cookie={cookie}
        username={user.username}
      />
      <main className="mt-12 sm:mt-20 px-4 md:px-8 h-screen">
        <section className="mb-8">
          <h1>Outgoing Requests 📤</h1>
          <div>
            Feedback on your outfits that you've requested from other users.
          </div>

          <table className="w-full text-xs md:text-sm text-left overflow-x-scroll my-4">
            <thead className="text-xs uppercase bg-custom-tan sticky top-0">
              <tr>
                <th scope="col" className="p-2">
                  Request Date
                </th>
                <th scope="col" className="p-2">
                  Sent To
                </th>
                <th scope="col" className="p-2">
                  Outfit
                </th>
                <th scope="col" className="p-2">
                  Questions
                </th>
                <th scope="col" className="p-2">
                  Response
                </th>
              </tr>
            </thead>
            <tbody>
              {outgoing_requests.map((request) => (
                <tr className="p-2">
                  <td className="p-2">{request.request_date}</td>
                  <td className="p-2">{request.to_username}</td>
                  <td className="p-2">
                    <>
                      <img
                        className="object-cover w-fit h-24"
                        src={request.outfit.picture_url}
                      />

                      {request.outfit.title}
                    </>
                  </td>
                  <td className="p-2">
                    {request.question_responses.map((question) => (
                      <>
                        {question.question}
                        <br />
                      </>
                    ))}
                  </td>
                  <td className="p-2">(no response)</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h1>Incoming Requests 📥</h1>
          <div>Users who have requested your feedback on their outfits.</div>

          <div className="my-4">
            <h1 className="text-slate-300">Empty - No incoming requests yet</h1>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
