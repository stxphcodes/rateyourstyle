export async function GetUsername(server: string, cookie: string): Promise<string | Error> { 
    let error: Error | null = null 
    let username: string = ""

    await fetch(`${server}/api/username`, {
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

export type User = {
    username: string;
    email: string;
}


export async function GetUser(server: string, cookie: string): Promise<User | Error> { 
    let error: Error | null = null 
    let user: User = {
        username: "",
        email: ""
    }

    await fetch(`${server}/api/user`, {
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

            return response.json()
        }).then(data => {
            user = data
        })
        .catch((err: Error) => {
            error = err
        });

    if (error) {
        return error
    }

    return user
}