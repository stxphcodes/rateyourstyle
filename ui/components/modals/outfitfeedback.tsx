import { Modal } from ".";
import { Outfit } from "../../apis/get_outfits";
import Link from "next/link";
import { useState, useEffect } from "react";
import { OutfitItemList } from "../outfitcard";
import { RatingDiv } from "../outfitcard";
import { GetOutfitFeedbackResponse } from "../../apis/get_feedback";

export function OutfitFeedbackModal(props: {
  clientServer: string;
  cookie?: string;
  handleClose: any;
  data: GetOutfitFeedbackResponse;
  asRequestor: boolean;
}) {
  const [edit, setEdit] = useState(false);

  const [questionResponses, setQuestionResponses] = useState(
    props.data.question_responses
  );

  const handleResponseChange = (e: any, questionId: string) => {
    let index = questionResponses?.findIndex(
      (item) => item.question_id === questionId
    );

    if (index && index >= 0) {
    }
    let filtered = questionResponses?.filter(
      (item) => item.question_id === questionId
    );

    if (filtered) {
      let item = filtered[0];
      item.response = e.target.value();
    }
  };

  return (
    <Modal
      handleClose={props.handleClose}
      fullHeight={true}
      wideScreen={true}
      noPadding={true}
    >
      <>
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

          {props.data.question_responses &&
            props.data.question_responses.map((item, index) => (
              <div key={item.question_id} className="my-4">
                <div>
                  {index + 1}. {item.question}
                </div>

                <textarea
                  rows={3}
                  className="w-5/6"
                  disabled={edit === false}
                />
              </div>
            ))}

          {!props.asRequestor && (
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
                onClick={(e) => {
                  e.preventDefault();
                  // setEdit(!edit);
                }}
              >
                submit
              </button>
            </div>
          )}
        </div>
      </>
    </Modal>
  );
}

function EditResponses() {
  return <div></div>;
}
