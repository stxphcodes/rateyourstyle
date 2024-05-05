import { Outfit } from "./get_outfits"


export type GetOutfitFeedbackResponse = {
  request_id: string 
  request_date: string 
  to_username: string 
  from_username: string
  outfit: Outfit
  accepted: boolean 
  response_date: string

  question_responses?: QuestionResponse[]
}

export type QuestionResponse = {
    question_id: string 
    question: string 
    response: string
}

export async function GetFeedback(server: string, cookie: string, id: string):  Promise<GetOutfitFeedbackResponse | Error> {
  let resp: GetOutfitFeedbackResponse | Error = {
    request_id: "",
    request_date: "",
    to_username:"",
    from_username: "",
    accepted: false, 
    response_date: "",
    outfit: {
      id: "",
      user_id: "",
      username: "",
      description: "",
      style_tags: [],
      items: [],
      private: false,
      date: "",
      title: "",
      picture_url: "",
      picture_url_resized: "",
    }
  }

  await fetch(`${server}/api/feedback/${id}`, {
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


export async function GetOutgoingFeedback(
  server: string,
  cookie: string,
): Promise<GetOutfitFeedbackResponse[] | Error> {
  let resp: GetOutfitFeedbackResponse[] | Error = []

  await fetch(`${server}/api/outgoing-feedback`, {
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

export async function GetIncomingFeedback(
  server: string,
  cookie: string,
): Promise<GetOutfitFeedbackResponse[] | Error> {
  let resp: GetOutfitFeedbackResponse[] | Error = []

  await fetch(`${server}/api/incoming-feedback`, {
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

