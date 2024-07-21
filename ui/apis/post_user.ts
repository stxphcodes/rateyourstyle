import { ERR_GENERAL_INTERNAL_SERVER, ERR_SIGNUP_BAD_REQUEST, ERR_SIGNUP_FAILED_DEPENDENCY_EMAIL, ERR_SIGNUP_FAILED_DEPENDENCY_USERNAME, StatusCodes } from "./errors";
import { UserProfile, UserGeneral } from "./get_user";

export async function SetCookieExpiration(cookie: string, expDays: number)  {
  let date = new Date();
  date.setTime(date.getTime() + (expDays * 24 * 60 * 60 * 1000));
  let dateStr =  date.toUTCString();
  let newCookie = cookie +";expires=" + dateStr +";path=/"
  return newCookie;
}

export async function PostUser(
  server: string,
  username: string,
  email: string,
  password: string
): Promise<Error | null> {
  let error: Error | null = null;
  //let cookie: string = ""

  try {
    const resp = await fetch(`${server}/api/user`, {
      method: "POST",
      body: JSON.stringify({
        username: username,
        email: email,
        password: password,
      }),
      headers: {"content-type": "application/json"},
    });

    const data = await resp.text();
    switch (resp.status) {
      case StatusCodes.OK, StatusCodes.OK_CREATED:
        //cookie = data;
        break;
      case StatusCodes.BAD_REQUEST:
        throw new Error(ERR_SIGNUP_BAD_REQUEST);
      case StatusCodes.FAILED_DEPENDENCY:
        if (data.includes("email")) {
          throw new Error(ERR_SIGNUP_FAILED_DEPENDENCY_EMAIL)
        } else {
          throw new Error(ERR_SIGNUP_FAILED_DEPENDENCY_USERNAME)
        }
      default:
        throw new Error(ERR_GENERAL_INTERNAL_SERVER)
    }

  } catch (e) {
    if (e instanceof Error) {
      error = e;
    }
  }

  return error;

  // if (error) {
  //   return error;
  // }

  // return SetCookieExpiration(cookie, 365)
}


export async function PostUserProfile(
  server: string,
  cookie: string,
  userProfile: UserProfile,
): Promise<Error | null> {
  let error: Error | null = null

  await fetch(`${server}/api/user-profile`, {
      method: "POST",
      body: JSON.stringify(userProfile),
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

export async function PostUserGeneral(
  server: string,
  cookie: string,
  userGeneral: UserGeneral,
): Promise<Error | null> {
  let error: Error | null = null

  await fetch(`${server}/api/user-general`, {
      method: "POST",
      body: JSON.stringify(userGeneral),
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