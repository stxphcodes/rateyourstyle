import { UserProfile } from "./get_user";

export type OutfitItem = {
  id: string;
  date_added?: string;
  user_id ?:string;
  outfit_ids ?:string[];

  brand: string;
  link: string;
  description: string;
  size: string;
  price: string;
  rating: number;
  review: string;
  color: string;
  store: string;
};

export type Outfit = {
  id: string;
  date: string;
  user_id: string;
  username: string;
  title: string;
  picture_url: string;
  picture_url_resized: string;
  description: string;
  style_tags: string[];
  items: OutfitItem[];
  item_ids?: string[];
  private: boolean;

  user_profile?: UserProfile;
  rating_count?: number;
  rating_average?: number;
};

export async function GetOutfits(server: string, count?: number): Promise<Outfit[] | Error> {
  let error: Error | null = null;
  let outfits: Outfit[] = [];

  let url = `${server}/api/outfits`
  if (count && count > 0) {
    url = url + `?count=${count}`
  }

  await fetch(url)
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


export async function GetBusinessOutfits(server: string, cookie: string, businessName ?: string): Promise<Outfit[] | Error> { 
  let error: Error | null = null 
  let outfits: Outfit[] = []

  let url = `${server}/api/business-outfits`
  if (businessName) {
      url = url + `?business=${businessName}`
  }
  
  await fetch(url, {
      method: "GET",
      headers: {
          'content-type': "text/plain",
          'rys-login': cookie,
      },
  })
      .then((response) => {
          if (!response.ok) {
              throw new Error("response not ok");
          }

          return response.json()
      }).then(data => {
          outfits = data
      })
      .catch((err: Error) => {
          error = err
      });

  if (error) {
      return error
  }

  return outfits
}
