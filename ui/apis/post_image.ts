export async function PostImage(
    formData: FormData,
    cookie: string,
): Promise<string | Error> {
    let error: Error | null = null
    let imageURL: string = ""

    await fetch("http://localhost:8000/image", {
        method: "POST",
        body: formData,
        headers: {
            "rys-login": cookie,
        },
    }).then((response) => {
            if (!response.ok) {
                throw new Error("response not ok");
            }

            return response.text()
        }).then(data => {
            imageURL = data
        })
        .catch((err: Error) => {
            error = err
        });

    if (error) {
        return error
    }

    return imageURL

}