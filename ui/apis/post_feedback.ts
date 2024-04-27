export type ClosetRequest = {
    name: string;
    description: string;
    reason: string;
    link: string;
    user_email: string;
    owner: boolean;
}


export async function PostClosetRequest(
  server: string,
  cookie: string,
  closetRequest: ClosetRequest,
): Promise<Error | null> {
  let error: Error | null = null

  await fetch(`${server}/api/closet-request`, {
      method: "POST",
      body: JSON.stringify(closetRequest),
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