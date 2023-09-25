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
};

export async function GetOutfits(): Promise<Outfit[] | Error> {
  let error: Error | null = null;
  let outfits: Outfit[] = [];

  await fetch("http://localhost:8000/outfits")
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
