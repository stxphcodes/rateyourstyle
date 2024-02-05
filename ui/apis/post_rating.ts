export async function PostRating(
    server: string,
    cookie: string,
    outfitId: string,
    rating: number,
    review: string,
): Promise<string | Error> {
    let error: Error | null = null

    try {
        const resp = await fetch(`${server}/api/rating`, {
            method: "POST",
            body: JSON.stringify({
                outfit_id: outfitId, 
                rating: rating,
                review: review,
            }),
            headers: { "content-type": "application/json",
            "rys-login": cookie },
        })

        // TODO: Check why this is getting text
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