export async function GetBusinesses(server: string, cookie: string): Promise<string[] | Error> {
    let error: Error | null = null
    let businessIds: string[] = []

    await fetch(`${server}/api/businesses`, {
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
        }).then((data) => {
            businessIds = data
        })
        .catch((err: Error) => {
            error = err
        });

    if (error) {
        return error
    }

    return businessIds
}

