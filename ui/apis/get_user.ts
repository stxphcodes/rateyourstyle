export async function GetUsername(cookie: string): Promise<string | Error> { 
    let error: Error | null = null 
    let username: string = ""

    await fetch("http://localhost:8000/username", {
        method: "POST",
        body: cookie,
        headers: {
            'content-type': "text/plain"
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
            console.log("in error")
            console.log(err)
            error = err
        });

    if (error) {
        return error
    }

    console.log("this is username")
    console.log(username)

    return username
}