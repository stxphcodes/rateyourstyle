export async function PostRating(
    cookie: string,
    outfitId: string,
    rating: number,
   
): Promise<string | Error> {
    let error: Error | null = null

    try {
        const resp = await fetch("http://localhost:8000/rating", {
            method: "POST",
            body: JSON.stringify({
                outfit_id: outfitId, 
                rating: rating,
            }),
            headers: { "content-type": "application/json",
            "rys-login": cookie },
        })

        const data = await resp.text()

        if (resp.ok) {
            cookie = data
        } else {
            throw new Error(data)
        }

    } catch (e) {
        if (e instanceof Error) {
            error = e
        }
    }

    if (error) {
        return error
    }

    return cookie

}