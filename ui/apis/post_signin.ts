import { SetCookieExpiration } from "./post_user";

export async function PostSigninPassword(
  authServer: string,
  username: string,
  password: string
): Promise<string | Error> {
  let error: Error | null = null;
  let cookie: string = "";

  let url = `${authServer}/auth/signin/password`
  await fetch(url, {
    method: "POST",
    headers: {"content-type": "application/json"},
    body: JSON.stringify({
      username: username.toLowerCase(),
      password: password,
    })
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

  return SetCookieExpiration(cookie, 365);
}

export async function PostSSO(

  ): Promise<string | Error> {
    let error: Error | null = null;
    let cookie: string = "";
  
    //`${server}/api/signin`
    let url = "http://localhost:8003/auth/google/signin"
    await fetch(url, {
      method: "GET",
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
  
    return SetCookieExpiration(cookie, 365);
  }


  export async function PostSigninOTP(
    authServer: string, 
    username: string,
    otp: string,
    ): Promise<string | Error> {
      let error: Error | null = null;
      let cookie: string = "";
    
      //`${server}/api/signin`

      let url = `${authServer}/auth/signin/otp`
      await fetch(url, {
        method: "POST",
        headers: {"content-type": "application/json"},
        body: JSON.stringify({
          user: username.toLowerCase(),
          otp: otp,
        })
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
    
      return SetCookieExpiration(cookie, 365);
    }
