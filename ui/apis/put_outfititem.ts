import { OutfitItem } from "./get_outfits";
export async function PutOutfitItem(
    server: string,
    cookie: string,
    outfitItem: OutfitItem,
): Promise<Error | null> {
    let error: Error | null = null

    await fetch(`${server}/api/outfit-item`, {
        method: "PUT",
        body: JSON.stringify(outfitItem),
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