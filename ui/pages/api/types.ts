export type OutfitItem = {
  brand: string;
  link: string;
  description: string;
  size: string;
  price: string;
  rating: string;
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
};

export type List = {
  title: string;
  date: string;
  outfit_ids: string[];
  tag: string;
};

export type ResponseError = {
  message: string;
};
