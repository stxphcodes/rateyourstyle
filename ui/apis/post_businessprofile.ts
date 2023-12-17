import { BusinessProfile } from "./get_businessprofile";


export async function PostBusinessProfile(
  server: string,
  cookie: string,
  businessProfile: BusinessProfile,
): Promise<Error | null> {
  let error: Error | null = null

  await fetch(`${server}/api/business-profile`, {
      method: "POST",
      body: JSON.stringify(businessProfile),
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