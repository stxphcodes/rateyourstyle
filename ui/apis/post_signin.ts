import {
  ERR_GENERAL_BAD_REQUEST,
  ERR_GENERAL_INTERNAL_SERVER,
  ERR_POST_OTP_EXPIRED,
  ERR_POST_OTP_INVALID,
  StatusCodes,
} from "./errors";
import { SetCookieExpiration } from "./post_user";

export async function PostSigninPassword(
  authServer: string,
  username: string,
  password: string
): Promise<string | Error> {
  let error: Error | null = null;
  let cookie: string = "";

  let url = `${authServer}/auth/signin/password`;
  await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      username: username.toLowerCase(),
      password: password,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("response not ok");
      }

      return response.text();
    })
    .then((data) => {
      cookie = data;
    })
    .catch((err: Error) => {
      error = err;
    });

  if (error) {
    return error;
  }

  return SetCookieExpiration(cookie, 365);
}

export async function PostSigninOTP(
  authServer: string,
  username: string,
  otp: string
): Promise<string | Error> {
  let error: Error | null = null;
  let cookie: string = "";

  let url = `${authServer}/auth/signin/otp`;
  await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      user: username.toLowerCase(),
      otp: otp,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        switch (response.status) {
          case StatusCodes.NOT_FOUND:
            throw new Error(ERR_POST_OTP_INVALID);
          case StatusCodes.FAILED_DEPENDENCY:
            throw new Error(ERR_POST_OTP_EXPIRED);
          case StatusCodes.BAD_REQUEST:
            throw new Error(ERR_GENERAL_BAD_REQUEST);
          default:
            throw new Error(ERR_GENERAL_INTERNAL_SERVER);
        }
      }

      return response.text();
    })
    .then((data) => {
      cookie = data;
    })
    .catch((err: Error) => {
      error = err;
    });

  if (error) {
    return error;
  }

  return SetCookieExpiration(cookie, 365);
}
