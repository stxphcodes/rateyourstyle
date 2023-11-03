import { UserProfile } from "./get_user";

export type OutfitItem = {
  brand: string;
  link: string;
  description: string;
  size: string;
  price: string;
  rating: number;
  review: string;
};

export type Outfit = {
  id: string;
  date: string;
  user_id: string;
  title: string;
  picture_url: string;
  description: string;
  style_tags: string[];
  items: OutfitItem[];
  private: boolean;

  user_profile?: UserProfile;
};

export async function GetOutfits(server: string): Promise<Outfit[] | Error> {
  let error: Error | null = null;
  let outfits: Outfit[] = [];

  await fetch(`${server}/api/outfits`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("response not ok");
      }

      return response.json();
    })
    .then((data: Outfit[]) => {
      outfits = data;
    })
    .catch((err: Error) => {
      error = err;
    });

  if (error) {
    return error;
  }

  return outfits;
}

export async function GetOutfitsByUser(server: string, cookie: string): Promise<Outfit[] | Error> {
  let error: Error | null = null;
  let outfits: Outfit[] = [];

  await fetch(`${server}/api/user/outfits`, {
    method: "GET",
    headers: {
      'content-type': "application/json",
      'rys-login': cookie,
    },
  })
    .then((response) => {
      if (!response.ok) {
        // no outfits for user
        if (response.status == 404) {
          return outfits;
        }

        throw new Error("response not ok");
      }

      return response.json();
    })
    .then((data: Outfit[]) => {
      outfits = data;
    })
    .catch((err: Error) => {
      error = err;
    });

  if (error) {
    return error;
  }

  return outfits;
}


export async function GetPublicOutfitsByUser(server: string, cookie: string, username: string): Promise<Outfit[] | Error> {
  let error: Error | null = null;
  let outfits: Outfit[] = [];

  await fetch(`${server}/api/user/public-outfits?username=`+username, {
    method: "GET",
    headers: {
      'content-type': "application/json",
      'rys-login': cookie,
    },
  })
    .then((response) => {
      if (!response.ok) {
        // no outfits for user
        if (response.status == 404) {
          return outfits;
        }

        throw new Error("response not ok");
      }

      return response.json();
    })
    .then((data: Outfit[]) => {
      outfits = data;
    })
    .catch((err: Error) => {
      error = err;
    });

  if (error) {
    return error;
  }

  return outfits;
}
