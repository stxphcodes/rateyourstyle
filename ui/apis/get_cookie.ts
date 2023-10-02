export async function GetCookie(server: string): Promise<string | Error> {
  let error: Error | null = null;
  let cookie: string = "";

  await fetch(`${server}/api/cookie`)
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
