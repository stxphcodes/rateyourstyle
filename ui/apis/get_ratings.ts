export type Rating = {
  cookie: string;
  user_id: string;
  username: string;
  outfit_id: string;
  rating: any;
  review?: string;
  date?: string;
};

export async function GetRatings(server: string, cookie: string): Promise<Rating[] | Error> {
  let error: Error | null = null;
  let ratings: Rating[] = [];

  await fetch(`${server}/api/ratings`, {
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

      // user doesn't have any ratings
      if (response.status == 204) {
        return ratings;
      }

      return response.json();
    })
    .then((data: Rating[]) => {
      ratings = data;
    })
    .catch((err: Error) => {
      error = err;
    });

  if (error) {
    return error;
  }

  return ratings;
}

export async function GetRatingsByOutfit(server: string, outfitId: string): Promise<Rating[] | Error> {
  let error: Error | null = null;
  let ratings: Rating[] = [];

  await fetch(`${server}/api/ratings/` + outfitId, {
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
    })
    .catch((err: Error) => {
      error = err;
    });

  if (error) {
    return error;
  }

  return ratings;
}
