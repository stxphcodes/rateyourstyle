import { QuestionResponse } from "./get_feedback"
export type FeedbackRequest = {
    to_username: string 
    outfit_id: string 
    expiration_date: string 
    questions: string[]
}


export async function PostFeedbackRequest(
  server: string,
  cookie: string,
  feedbackRequest: FeedbackRequest,
): Promise<Error | null> {
  let error: Error | null = null

  await fetch(`${server}/api/feedback-request`, {
      method: "POST",
      body: JSON.stringify(feedbackRequest),
      headers: {
          "content-type": "application/json",
          "rys-login": cookie
      },
  }).then((response) => {
      if (!response.ok) {
          throw new Error("response not ok");
      }
  }).catch((err: Error) => {
      error = err
  });

  return error
}

export async function PostFeedbackAcceptance(
    server: string,
    cookie: string,
    requestId: string,
   accept: boolean,
  ): Promise<Error | null> {
    let error: Error | null = null;
    let url = `${server}/api/feedback-acceptance/${requestId}?accept=`
    if (accept) {
        url = url+"true"
    } else {
        url = url+"false"
    }
  
    await fetch(url, {
        method: "POST",
        headers: {
            "content-type": "application/json",
            "rys-login": cookie
        },
    }).then((response) => {
        if (!response.ok) {
            throw new Error("response not ok");
        }
    }).catch((err: Error) => {
        error = err
    });
  
    return error
  }


  export async function PostFeedbackResponse(
    server: string,
    cookie: string,
    requestId: string,
    questionResponses: QuestionResponse[],
  ): Promise<Error | null> {
    let error: Error | null = null;

    let toSend = questionResponses.reduce((o, item) => Object.assign(o, {[item.question_id]: item.response}), {});  
 
    await fetch( `${server}/api/feedback-response/${requestId}`, {
        method: "POST",
        headers: {
            "content-type": "application/json",
            "rys-login": cookie
        },
        body: JSON.stringify(toSend),
    }).then((response) => {
        if (!response.ok) {
            throw new Error("response not ok");
        }
    }).catch((err: Error) => {
        error = err
    });
  
    return error
  }