import { Outfit } from "./get_outfits"

export type GetOutgoingFeedbackResponse = {
    request_id: string 
    request_date: string 
    to_username: string 
    outfit: Outfit
    question_responses: QuestionResponse[]
}

export type QuestionResponse = {
    question_id: string 
    question: string 
    response: string
}


export async function GetOutgoingFeedback(
  server: string,
  cookie: string,
): Promise<GetOutgoingFeedbackResponse[] | Error> {
  let resp: GetOutgoingFeedbackResponse[] | Error = []

  await fetch(`${server}/api/feedback-request`, {
      method: "GET",
      headers: {
          "content-type": "application/json",
          "rys-login": cookie
      },
  }).then((response) => {
      if (!response.ok) {
          throw new Error("response not ok");
      }

      return response.json()
  }).then((data) => {
    resp = data

  }).catch((err: Error) => {
     resp = err
  });

  return resp
}