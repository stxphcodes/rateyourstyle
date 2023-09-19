import { GetServerSidePropsContext } from "next";



export async function GetCookieSSR(context: GetServerSidePropsContext): Promise<string | Error> {
    let cookie = context.req.cookies["rys_user_id"];
    if (!cookie) {
        await fetch("http://localhost:8000/cookie")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("response not ok");
                }

                let newCookie = response.headers.get("set-cookie")
                if (newCookie) {
                    let cookieNameValue = newCookie.split("; ")[0]
                    let cookieExpiration = newCookie.split("; ")[2]
                    newCookie = cookieNameValue + "; " + cookieExpiration
                    context.res.setHeader('set-cookie', [newCookie])

                    cookie = cookieNameValue.split("=")[1]
                    return cookie
                }
            })
            .catch((err: Error) => {
                return err
            });
    }

  return new Error("no cookie created")

}

