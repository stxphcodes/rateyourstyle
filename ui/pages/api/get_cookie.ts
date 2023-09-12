// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import { ResponseError } from "./types";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseError>
) {

    let cookie = req.cookies.get("rys_user_id")
    if (!cookie) {
        await.fetch("POST", "http://localhost:8000/cookie")
        .then((response) => {
            if (!response.ok) {
                throw Error(response)
            }
        })
    }


}