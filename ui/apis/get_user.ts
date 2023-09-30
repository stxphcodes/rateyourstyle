export async function GetUsername(cookie: string): Promise<string | Error> { 
    let error: Error | null = null 
    let username: string = ""

    await fetch("http://localhost:8000/username", {
        method: "GET",
        headers: {
            'content-type': "text/plain",
            'rys-login': cookie,
        },
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("response not ok");
            }

            return response.text()
        }).then(data => {
            username = data
        })
        .catch((err: Error) => {
            error = err
        });

    if (error) {
        return error
    }

    return username
}