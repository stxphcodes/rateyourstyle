export type Rating = {
  user_id: string;
  outfit_id: string;
  rating: any;
};

export async function GetRatings(server: string): Promise<Rating[] | Error> {
  let error: Error | null = null;
  let ratings: Rating[] = [];

  await fetch(`${server}/api/ratings`, {
    method: "GET",
    headers: {
      "content-type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("response not ok");
      }

      return response.json();
    })
    .then((data: Rating[]) => {
      ratings = data;
      console.log("in sever");
      console.log(ratings[0].outfit_id);
    })
    .catch((err: Error) => {
      error = err;
    });

  if (error) {
    return error;
  }

  return ratings;
}
