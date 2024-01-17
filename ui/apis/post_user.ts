import { UserProfile } from "./get_user";

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
): Promise<string | Error> {
  let error: Error | null = null;
  let cookie: string = ""

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
    if (resp.ok) {
      cookie = data;
    } else {
      throw new Error(data);
    }
  } catch (e) {
    if (e instanceof Error) {
      error = e;
    }
  }

  if (error) {
    return error;
  }

  return SetCookieExpiration(cookie, 365)
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