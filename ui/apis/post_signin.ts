export async function PostSignIn(
  server: string,
  username: string,
  password: string
): Promise<string | Error> {
  let error: Error | null = null;
  let cookie: string = "";

  await fetch(`${server}/signin`, {
    method: "POST",
    body: JSON.stringify({
      username: username,
      password: password,
    }),
    headers: {"content-type": "application/json"},
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

  return cookie;
}
