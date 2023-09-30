export async function GetCookie(): Promise<string | Error> {
  let error: Error | null = null;
  let cookie: string = "";

  await fetch("http://localhost:8000/cookie")
    .then((response) => {
      if (!response.ok) {
        throw new Error("response not ok");
      }

      return response.text();
    })
    .then((data: string) => {
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
