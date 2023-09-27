export async function PostUser(
    username: string,
    email: string,
    password: string
): Promise<string | Error> {
    let error: Error | null = null
    let cookie: string = ""

    try {
        const resp = await fetch("http://localhost:8000/user", {
            method: "POST",
            body: JSON.stringify({
                username: username,
                email: email,
                password: password
            }),
            headers: { "content-type": "application/json" },
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