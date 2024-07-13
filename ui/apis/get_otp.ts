export async function GetOTP(authServer: string, usernameOrEmail: string): Promise<Error | null> {
  let error: Error | null = null;

  await fetch(`${authServer}/auth/signin/otp?user=${usernameOrEmail}`, {
    method: "GET",
    headers: {
      "content-type": "text/plain",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("response not ok");
      }
    })
    .catch((err: Error) => {
      error = err;
    });

  if (error) {
    return error;
  }

  return null;
}
