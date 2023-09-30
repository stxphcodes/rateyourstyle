import { OutfitItem, Outfit } from "./get_outfits";
export async function PostOutfit(
    server: string,
    cookie: string,
    outfit: Outfit,
): Promise<Error | null> {
    let error: Error | null = null

    await fetch(`${server}/outfit`, {
        method: "POST",
        body: JSON.stringify(outfit),
        headers: {
            "content-type": "application/json",
            "rys-login": cookie
        },
    }).then((response) => {
        if (!response.ok) {
            throw new Error("response not ok");
        }

        return response.text()
    }).catch((err: Error) => {
        error = err
    });

    return error

}