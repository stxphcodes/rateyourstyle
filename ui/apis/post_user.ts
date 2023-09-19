export async function PostUser(
    username: string,
    email: string,
    password: string
): Promise<string | Error> { 
    let error: Error | null = null
    let cookie: string = ""

    await fetch("http://localhost:8000/user", {
        method: "POST",
        body: JSON.stringify({
            username: username,
            email: email,
            password: password

        }),
        headers: { "content-type": "application/json" },
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("response not ok");
            }

            return response.text()
        }).then(data => {
            cookie = data
        })
        .catch((err: Error) => {
            error = err
        });

    if (error) {
        return error
    }

    return cookie

}