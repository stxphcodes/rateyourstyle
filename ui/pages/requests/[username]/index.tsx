import { GetServerSideProps } from "next";
import Link from "next/link";
import { useState, useMemo } from "react";

import { GetUser, User } from "../../../apis/get_user";
import { Navbar } from "../../../components/navarbar";
import { GetServerURL } from "../../../apis/get_server";
import { ClosetTable } from "../../../components/closet/table";
import { Footer } from "../../../components/footer";
import {
  GetIncomingFeedback,
  GetOutfitFeedbackResponse,
  GetOutgoingFeedback,
} from "../../../apis/get_feedback";
import { Table, TableHead } from "../../../components/table";
import { getFeedbackRequestStatus } from "../../../components/feedback";

type Props = {
  cookie: string;
  error: string | null;
  outgoing_requests: GetOutfitFeedbackResponse[];
  incoming_requests: GetOutfitFeedbackResponse[];
  username: string;
  clientServer: string;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  let props: Props = {
    clientServer: "",
    cookie: "",
    error: null,
    outgoing_requests: [],
    incoming_requests: [],
    username: "",
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

    props.username = userResp.username;
  }

  const outgoingResp = await GetOutgoingFeedback(server, props.cookie);
  if (outgoingResp instanceof Error) {
    props.error = outgoingResp.message;
    return { props };
  }
  props.outgoing_requests = outgoingResp;

  const incomingResp = await GetIncomingFeedback(server, props.cookie);
  if (incomingResp instanceof Error) {
    props.error = incomingResp.message;
    return { props };
  }
  props.incoming_requests = incomingResp;

  return { props };
};

export default function Index({
  clientServer,
  cookie,
  username,
  outgoing_requests,
  incoming_requests,
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
      <Navbar clientServer={clientServer} cookie={cookie} username={username} />
      <main className="mt-12 sm:mt-20 px-4 md:px-8">
        <section className="mb-12">
          <h1>Outgoing Requests 📤</h1>
          <div>
            Feedback on your outfits that you've requested from other users.
          </div>
          {outgoing_requests.length === 0 ? (
            <h1 className="text-slate-300 h-48">
              Empty - No outgoing requests yet
            </h1>
          ) : (
            <Table width="w-fit">
              <>
                <TableHead
                  columns={["Request Date", "Sent To", "Outfit", "Response"]}
                />
                <tbody>
                  {outgoing_requests.map((request) => (
                    <tr
                      className="p-2 border-b-2 bg-white max-h-8 overflow-hidden"
                      key={request.request_id}
                    >
                      <td className="p-2 w-36">{request.request_date}</td>
                      <td className="p-2 w-36">
                        <a href={`/closet/${request.to_username}`}>
                          {request.to_username}
                        </a>
                      </td>
                      <td className="p-2 md:w-72">
                        <div className="flex gap-2 items-center overflow-scroll">
                          <img
                            className="object-cover w-fit h-24"
                            src={request.outfit.picture_url}
                          />

                          {request.outfit.title}
                        </div>
                      </td>
                      <td className="p-2 md:w-36">
                        <button
                          className="font-bold hover:text-custom-lime"
                          onClick={() => {
                            let url = window.location.href;
                            url += `?feedback=${request.request_id}`;
                            window.location.href = url;
                          }}
                        >
                          {getFeedbackRequestStatus(
                            request.accepted,
                            request.response_date
                          )}
                          <br />
                          (view)
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </>
            </Table>
          )}
        </section>

        <section className="my-6">
          <h1>Incoming Requests 📥</h1>
          <div>Users who have requested your feedback on their outfits.</div>

          {incoming_requests.length === 0 ? (
            <h1 className="text-slate-300 h-48">
              Empty - No incoming requests yet
            </h1>
          ) : (
            <Table width="w-fit">
              <>
                <TableHead
                  columns={["Request Date", "From", "Outfit", "Your Response"]}
                />
                <tbody>
                  {incoming_requests.map((request) => (
                    <tr
                      className="p-2 border-b-2 bg-white max-h-8 overflow-hidden"
                      key={request.request_id}
                    >
                      <td className="p-2 w-36">{"some date"}</td>
                      <td className="p-2 w-36">
                        <a href={`/closet/${request.from_username}`}>
                          {request.from_username}
                        </a>
                      </td>
                      <td className="p-2 md:w-72">
                        <div className="flex gap-2 items-center overflow-scroll">
                          <img
                            className="object-cover w-fit h-24"
                            src={request.outfit.picture_url}
                          />

                          {request.outfit.title}
                        </div>
                      </td>
                      <td className="p-2 md:w-36">
                        <button
                          className="font-bold hover:text-custom-lime"
                          onClick={() => {
                            let url = window.location.href;
                            url += `?feedback=${request.request_id}`;
                            window.location.href = url;
                          }}
                        >
                          {getFeedbackRequestStatus(
                            request.accepted,
                            request.response_date
                          )}
                          <br />
                          (view)
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </>
            </Table>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
