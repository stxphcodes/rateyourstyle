import { Modal } from ".";
import { useState, useEffect } from "react";
import { OutfitItemList } from "../outfitcard";
import { GetOutfitFeedbackResponse } from "../../apis/get_feedback";
import { getFeedbackRequestStatus } from "../feedback";
import {
  PostFeedbackAcceptance,
  PostFeedbackResponse,
} from "../../apis/post_feedbackrequest";

export function OutfitFeedbackModal(props: {
  clientServer: string;
  cookie?: string;
  handleClose: any;
  data: GetOutfitFeedbackResponse;
  currentUsername: string;
}) {
  const status = getFeedbackRequestStatus(
    props.data.accepted,
    props.data.acceptance_date,
    props.data.response_date
  );

  const [edit, setEdit] = useState(false);

  const [questionResponses, setQuestionResponses] = useState(
    props.data.question_responses
  );

  const [validationErr, setValidationErr] = useState(false);

  const handleResponseChange = (e: any, questionId: string) => {
    if (!questionResponses) {
      return;
    }

    setValidationErr(false);

    let arr = [...questionResponses];
    let index = arr?.findIndex((item) => item.question_id === questionId);

    if (index >= 0) {
      arr[index].response = e.target.value;
    }

    setQuestionResponses(arr);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    let emptyResponse = false;
    questionResponses?.forEach((item) => {
      if (!item.response) {
        emptyResponse = true;
      }
    });

    if (emptyResponse) {
      setValidationErr(true);
      return;
    }

    if (props.cookie && questionResponses) {
      const resp = await PostFeedbackResponse(
        props.clientServer,
        props.cookie,
        props.data.request_id,
        questionResponses
      );

      if (!resp) {
        window.location.replace(location.pathname);
      }
    }
  };

  return (
    <Modal
      handleClose={props.handleClose}
      fullHeight={true}
      wideScreen={true}
      noPadding={true}
    >
      <div>
        <div className="md:flex md:gapx-2 md:align-start md:flex-row w-full">
          <div className="basis-1/2">
            <img
              alt={props.data.outfit.description}
              className="mb-2"
              src={props.data.outfit.picture_url}
            ></img>
          </div>

          <div className="basis-1/2 w-full">
            <div className="px-4 mb-4">
              <div>
                {props.data.outfit.username ? (
                  <a
                    className=""
                    href={`/closet/${props.data.outfit.username}`}
                  >
                    {props.data.outfit.username}&apos;s closet
                  </a>
                ) : (
                  "anonymous"
                )}
                <span className=" text-xs">
                  {" | "} {props.data.outfit.date}
                </span>
              </div>

              <div className="text-2xl">{props.data.outfit.title}</div>
              <div className="flex gap-2">
                {props.data.outfit.style_tags.map((item) => (
                  <div className="" key={item}>
                    {item}
                  </div>
                ))}
              </div>

              <div className="pl-6">
                <OutfitItemList outfitItems={props.data.outfit.items} />
              </div>
            </div>
          </div>
        </div>
        <div className="p-4">
          <h1>Outfit Feedback Requested</h1>
          <h4 className="my-2">
            {props.data.from_username} requested feedback from{" "}
            {props.data.to_username} on {props.data.request_date}.
          </h4>

          {questionResponses &&
            questionResponses.map((item, index) => (
              <div key={item.question_id} className="my-4">
                <div>
                  {index + 1}. {item.question}
                </div>

                {status !== "pending" && status !== "declined" && (
                  <textarea
                    rows={3}
                    className="w-5/6"
                    disabled={edit === false}
                    onChange={(e) => handleResponseChange(e, item.question_id)}
                    value={item.response}
                  />
                )}
              </div>
            ))}

          {status === "pending" &&
            props.currentUsername === props.data.to_username && (
              <AcceptRequestForm
                clientServer={props.clientServer}
                cookie={props.cookie}
                data={props.data}
              />
            )}

          {status !== "pending" &&
            status !== "declined" &&
            props.data.to_username === props.currentUsername && (
              <>
                <div className="flex gap-2">
                  <button
                    className="primaryButton"
                    onClick={(e) => {
                      e.preventDefault();
                      setEdit(!edit);
                    }}
                  >
                    edit response
                  </button>
                  <button
                    className="bg-gradient rounded p-2 "
                    onClick={handleSubmit}
                  >
                    submit
                  </button>
                </div>
                {validationErr && (
                  <div className="bg-custom-pink p-2 rounded my-2 w-fit">
                    Error: All questions must contain responses.
                  </div>
                )}
              </>
            )}
        </div>
      </div>
    </Modal>
  );
}

function AcceptRequestForm(props: {
  clientServer: string;
  cookie?: string;
  data: GetOutfitFeedbackResponse;
}) {
  const [error, setError] = useState<boolean>(false);

  const handleClick = async (e: any) => {
    e.preventDefault();

    let accept = false;
    if (e.target.id === "accept") {
      accept = true;
    }

    if (props.cookie) {
      const resp = await PostFeedbackAcceptance(
        props.clientServer,
        props.cookie,
        props.data.request_id,
        accept
      );

      if (resp instanceof Error) {
        setError(true);
      } else {
        window.location.reload();
      }
    }
  };

  return (
    <div className="shadow-lg rounded px-4 py-2 bg-gradient w-fit">
      {error ? (
        <>
          <h2>Uh oh</h2>
          <div>
            Sorry, there was an error processing your request. <br /> Please
            refresh the page and try again or contact sitesbystephanie@gmail.com
            if the issue persists.
          </div>
        </>
      ) : (
        <>
          <h2>Would you like to accept their request?</h2>
          <div className="flex gap-2 my-4">
            <button className="primaryButton" id="accept" onClick={handleClick}>
              Accept
            </button>
            <button
              className="bg-custom-pink p-2 rounded"
              id="decline"
              onClick={handleClick}
            >
              Decline
            </button>
          </div>
        </>
      )}
    </div>
  );
}