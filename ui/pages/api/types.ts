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
  user: string;
  title: string;
  model: string;
  picture_urls: string[];
  description: string;
  style_tags: string[];
  items: OutfitItem[];
  overall_rating: number;
  audience_rating: number;
  audience_rating_count: number;
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
