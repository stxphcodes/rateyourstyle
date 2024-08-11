import { useEffect, useState } from "react";

import { Modal } from "./";
import { Outfit } from "../../apis/get_outfits";
import { GetOutfitsByUser } from "../../apis/get_outfits";
import {
  FeedbackRequest,
  PostFeedbackRequest,
} from "../../apis/post_feedbackrequest";

const questions = [
  "How would you describe this outfit?",
  "What do you think about the colors on this outfit?",
  "What do you think about the silhouette/fit of this outfit?",
  "What do you think about the outfit's originality?",
  "Do you think this fits my aesthetic?",
];

export function RequestFeedbackModal(props: {
  clientServer: string;
  cookie: string;
  handleClose: any;
  closetName: string;
}) {
  const [userOutfits, setUserOutfits] = useState<Outfit[] | null>(null);
  const [outfitSelected, setOutfitSelected] = useState<Outfit | null>(null);

  const [showForm, setShowForm] = useState(false);

  const [questionsSelected, setQuestionsSelected] = useState<string[]>([
    ...questions,
  ]);

  const [additionalQuestions, setAdditionalQuestions] = useState<string[]>([
    "",
  ]);

  const [submissionState, setSubmissionState] = useState<string>("");

  const [missingQuestions, setMissingQuestions] = useState(false);

  useEffect(() => {
    async function getData() {
      const resp = await GetOutfitsByUser(props.clientServer, props.cookie);
      if (resp instanceof Error) {
        //setErr(resp.message)
        return;
      }

      setUserOutfits(resp);
    }

    getData();
  }, []);

  const handleOutfitClick = (outfit: Outfit) => {
    setOutfitSelected(outfit);
    setShowForm(!showForm);
  };

  const handleQuestionCheckbox = (q: string) => {
    const newQuestions = [...questionsSelected];
    const index = newQuestions.indexOf(q);
    if (index < 0) {
      newQuestions.push(q);
    } else {
      newQuestions.splice(index, 1);
    }

    setMissingQuestions(false);
    setQuestionsSelected(newQuestions);
  };

  const addAdditionalQuestion = (e: any) => {
    e.preventDefault();
    setAdditionalQuestions([...additionalQuestions, ""]);
  };

  const removeAdditionalQuestion = (e: any, index: number) => {
    e.preventDefault();
    const newQuestions = [...additionalQuestions];
    newQuestions.splice(index, 1);

    setAdditionalQuestions(newQuestions);
  };

  const handleQuestionInput = (text: string, index: number) => {
    additionalQuestions[index] = text;
    setAdditionalQuestions([...additionalQuestions]);
    setMissingQuestions(false);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!outfitSelected) {
      return;
    }

    let q = questionsSelected.filter((question) => question);
    let addQ = additionalQuestions.filter((question) => question);
    let questions = [...q, ...addQ];

    if (!questions.length) {
      setMissingQuestions(true);
      return;
    }

    let req: FeedbackRequest = {
      to_username: props.closetName,
      outfit_id: outfitSelected?.id,
      expiration_date: "",
      questions: [...q, ...addQ],
    };

    const resp = await PostFeedbackRequest(
      props.clientServer,
      props.cookie,
      req
    );

    if (!resp) {
      setSubmissionState("success");
    } else {
      setSubmissionState("error");
    }
  };

  if (!props.cookie) {
    return (
      <Modal handleClose={props.handleClose} wideScreen={true}>
        <>
          <h1 className="mb-8">
            Request Outfit Feedback from {props.closetName}
          </h1>
          You must be signed into an account to access this feature.
        </>
      </Modal>
    );
  }

  return (
    <Modal handleClose={props.handleClose} wideScreen={true} fullHeight={true}>
      <>
        <h1 className="mb-8">
          Request Outfit Feedback from {props.closetName}
        </h1>

        {submissionState && (
          <div>
            {submissionState === "success" ? (
              <>
                Request sent to {props.closetName}. You will be notified if they
                accept your request. You can also keep track of your request
                status by going to your request page.
              </>
            ) : (
              <div>
                <h3>Uh oh :\</h3>
                <div>
                  We are encountering server issues. Please try refreshing the
                  page. If the issue persists, please contact
                  rateyourstyle@gmail.com.
                </div>
              </div>
            )}
          </div>
        )}

        {!showForm && !submissionState && (
          <>
            <div className="mb-4">
              Please select one outfit you&apos;d like to get feedback on.
            </div>
            <OutfitSelection
              clientServer={props.clientServer}
              cookie={props.cookie}
              userOutfits={userOutfits}
              outfitSelected={outfitSelected}
              handleOutfitClick={handleOutfitClick}
            />
          </>
        )}

        {outfitSelected && showForm && !submissionState && (
          <>
            <button
              className="bg-custom-pink w-1/4  rounded p-2 my-4"
              onClick={(e) => {
                e.preventDefault();
                setShowForm(!showForm);
              }}
            >
              Go Back
            </button>

            <div className="my-4">
              <div
                className={`w-48 shadow-md break-words 
             border-4 border-custom-pink`}
              >
                <img
                  className="object-contain hover:cursor-pointer"
                  src={outfitSelected.picture_url}
                />

                <div className="p-2">
                  <h6 className="font-bold">{outfitSelected.title}</h6>
                  <div>{outfitSelected.date}</div>
                </div>
              </div>
            </div>
            <div className="my-6">
              The following questions will be sent to {props.closetName} along
              with your selected outfit. <br />
              Please un-select any question(s) you don&apos;t want feedback on.
            </div>
            <RequestForm
              questionsSelected={questionsSelected}
              additionalQuestions={additionalQuestions}
              handleQuestionCheckbox={handleQuestionCheckbox}
              handleQuestionInput={handleQuestionInput}
              addAdditionalQuestion={addAdditionalQuestion}
              removeAdditionalQuestion={removeAdditionalQuestion}
            />
          </>
        )}

        {showForm && !submissionState && (
          <>
            <button
              className="bg-gradient w-full md:w-1/2 rounded p-2 my-4"
              onClick={handleSubmit}
            >
              submit
            </button>
            {missingQuestions && (
              <div className="w-fit p-2 bg-custom-pink text-white">
                **At least one question is required for submission.**
              </div>
            )}
          </>
        )}
      </>
    </Modal>
  );
}

function OutfitSelection(props: {
  userOutfits: Outfit[] | null;
  clientServer: string;
  cookie: string;
  outfitSelected: Outfit | null;
  handleOutfitClick: any;
}) {
  return (
    <div className="flex flex-wrap gap-4 justify-between">
      {props.userOutfits &&
        props.userOutfits.map((outfit) => {
          return (
            <div
              className={`w-44 shadow-md break-words 
            ${
              outfit.id === props?.outfitSelected?.id
                ? "border-4 border-custom-pink"
                : "border-none"
            }`}
              key={outfit.id}
            >
              <img
                onClick={() => {
                  props.handleOutfitClick(outfit);
                }}
                className="object-contain hover:cursor-pointer"
                src={outfit.picture_url}
              />

              <div className="p-2">
                <h6 className="font-bold">{outfit.title}</h6>
                <div>{outfit.date}</div>
              </div>
            </div>
          );
        })}
    </div>
  );
}

function RequestForm(props: {
  questionsSelected: string[];
  additionalQuestions: string[];
  handleQuestionCheckbox: any;
  handleQuestionInput: any;
  addAdditionalQuestion: any;
  removeAdditionalQuestion: any;
}) {
  return (
    <form>
      {questions.map((question, index) => (
        <div className="flex gap-x-2 items-center mb-2" key={`q-${index}`}>
          <input
            type="checkbox"
            checked={props.questionsSelected.includes(question)}
            value={question}
            onChange={(e) => props.handleQuestionCheckbox(e.target.value)}
          />
          <label>{question}</label>
        </div>
      ))}

      <div className="">
        <label>Other questions you&apos;d like to ask:</label>
        <button
          className="primaryButton text-xs"
          onClick={props.addAdditionalQuestion}
        >
          add question
        </button>

        {props.additionalQuestions.map((q, index) => (
          <div className="flex gap-2 my-3" key={`question-${index}`}>
            <input
              type="text"
              className="w-1/2"
              value={q}
              onChange={(e) => props.handleQuestionInput(e.target.value, index)}
            />
            <button
              className="primaryButton text-xs my-2"
              onClick={(e) => props.removeAdditionalQuestion(e, index)}
            >
              remove
            </button>
          </div>
        ))}
      </div>
    </form>
  );
}
