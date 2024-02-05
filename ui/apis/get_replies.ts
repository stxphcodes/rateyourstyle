export type Reply = {
    user_id: string;
    username: string;
    id: string;
    reply: string;
    date: string;
  };
  
  export async function GetReplies(server: string, cookie: string, outfitUserId: string): Promise<Reply[] | Error> {
    let error: Error | null = null;
    let replies: Reply[] = [];

    let outfitId = outfitUserId.split("-")[0]
    let userId = outfitUserId.split("-")[1]
  
    await fetch(`${server}/api/replies/` + outfitId + "/" + userId, {
      method: "GET",
      headers: {
        "content-type": "application/json",
        'rys-login': cookie,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("response not ok");
        }
  
        return response.json();
      })
      .then((data: Reply[]) => {
        replies = data;
      })
      .catch((err: Error) => {
        error = err;
      });
  
    if (error) {
      return error;
    }
  
    return replies;
  }