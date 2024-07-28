import { ERR_GENERAL_INTERNAL_SERVER } from "./errors";

export type PostImageResponse = {
    url: string;
    items: AIOutfitItem[];
}

export type AIOutfitItem = {
    Description: string;
    ColorHex: string;
}

export async function PostImageWithAI(
    server: string,
    formData: FormData,
    cookie: string,
): Promise<PostImageResponse | Error> {
    let error: Error | null = null
    let toReturn: PostImageResponse = {
        url: "",
        items: [],
    }

    await fetch(`${server}/api/image`, {
        method: "POST",
        body: formData,
        headers: {
            "rys-login": cookie,
        },
    }).then((response) => {
        if (!response.ok) {
            throw new Error(ERR_GENERAL_INTERNAL_SERVER);
        }

        return response.json()
    }).then((data: PostImageResponse) => {
        toReturn = data
    })
        .catch((err: Error) => {
            error = err
        });

    if (error) {
        return error
    }

    return toReturn

}