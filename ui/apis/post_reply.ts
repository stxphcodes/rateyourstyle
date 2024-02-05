export async function PostReply(
    server: string,
    cookie: string,
    outfitUserId: string,
    reply: string,
): Promise<Error | null> {
    let error : Error | null = null
    let outfitId = outfitUserId.split("-")[0]
    let userId = outfitUserId.split("-")[1]
    
    try {
        const resp = await fetch(`${server}/api/reply`, {
            method: "POST",
            body: JSON.stringify({
                rating_outfit_id: outfitId, 
                rating_user_id: userId,
                reply: reply,
            }),
            headers: { "content-type": "application/json",
            "rys-login": cookie },
        })

        if (resp.ok) {
            return null 
        } 

        error = new Error("response not ok")

    } catch (e) {
        if (e instanceof Error) {
            error = e
        }
    }

    if (error) {
        return error
    }

    return null
}