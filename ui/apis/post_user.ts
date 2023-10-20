import { UserProfile } from "./get_user";

export async function PostUser(
  server: string,
  cookie: string,
  username: string,
  email: string,
  password: string
): Promise<string | Error> {
  let error: Error | null = null;

  try {
    const resp = await fetch(`${server}/api/user`, {
      method: "POST",
      body: JSON.stringify({
        username: username,
        email: email,
        password: password,
        cookie: cookie,
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

  return cookie;
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