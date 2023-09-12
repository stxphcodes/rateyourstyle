// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import { Outfit, ResponseError } from "./types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Outfit[] | ResponseError>
) {

  let resp = await fetch("http://localhost:8000/outfits")
    .then((response) => {
   
      if (!response.ok) {
        throw new Error("response not ok")
      }

      return response.json()
    })
    .then((data: Outfit[]) => {

      return data

    }).catch((err) => {
      return err
    })

  
  // let data: Outfit[] = [
  //   {
  //     id: "00000001",
  //     date: "20220908",
  //     user: "admin",
  //     title: "French blue dress",
  //     model: "Jane Doe",
  //     picture_urls: [
  //       "https://previews.123rf.com/images/virinka/virinka1302/virinka130200059/17870600-cartoon-character-model.jpg",
  //     ],
  //     description:
  //       "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  //     style_tags: [],
  //     overall_rating: 4.2,
  //     audience_rating: 3.8,
  //     audience_rating_count: 20,
  //     items: [
  //       {
  //         brand: "alice and olivia",
  //         link: "",
  //         description: "blue burret",
  //         price: "25 USD",
  //         review: "Sed ut perspiciatis unde",
  //         rating: "4",
  //       },
  //       {
  //         brand: "alice and olivia",
  //         link: "",
  //         description: "blue tube dress",
  //         price: "100 USD",
  //         review: "Sed ut perspiciatis unde",
  //         rating: "4",
  //       },
  //       {
  //         brand: "alice and olivia",
  //         link: "",
  //         description: "plum fur trench coat",
  //         price: "200 USD",
  //         review: "Sed ut perspiciatis unde",
  //         rating: "4",
  //       },
  //     ],
  //   },
  //   {
  //     id: "00000001",
  //     date: "20220908",
  //     user: "admin",
  //     title: "French blue dress",
  //     model: "Jane Doe",
  //     picture_urls: [
  //       "https://previews.123rf.com/images/virinka/virinka1302/virinka130200059/17870600-cartoon-character-model.jpg",
  //     ],
  //     description:
  //       "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  //     style_tags: [],
  //     overall_rating: "4.2",
  //     items: [
  //       {
  //         brand: "alice and olivia",
  //         link: "",
  //         description: "blue burret",
  //         price: "25 USD",
  //         review: "Sed ut perspiciatis unde",
  //         rating: "4",
  //       },
  //       {
  //         brand: "alice and olivia",
  //         link: "",
  //         description: "blue tube dress",
  //         price: "100 USD",
  //         review: "Sed ut perspiciatis unde",
  //         rating: "4",
  //       },
  //       {
  //         brand: "alice and olivia",
  //         link: "",
  //         description: "plum fur trench coat",
  //         price: "200 USD",
  //         review: "Sed ut perspiciatis unde",
  //         rating: "4",
  //       },
  //     ],
  //   },
  // ];

  res.status(200).json(resp);
}
