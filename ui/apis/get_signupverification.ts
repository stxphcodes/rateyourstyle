import { ERR_GENERAL_INTERNAL_SERVER, ERR_GET_OTP_BAD_REQUEST, ERR_GET_OTP_NOT_FOUND, StatusCodes } from "./errors";

export async function GetSignupVerification(authServer: string, email: string): Promise<Error | null> {
  let error: Error | null = null;

  await fetch(`${authServer}/auth/signup/verification?user=${email}`, {
    method: "GET",
    headers: {
      "content-type": "text/plain",
    },
  })
    .then((response) => {
      if (!response.ok) {
        switch (response.status) {
            case StatusCodes.BAD_REQUEST:
                throw new Error(ERR_GET_OTP_BAD_REQUEST);
            default:
                throw new Error(ERR_GENERAL_INTERNAL_SERVER)
        }
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
