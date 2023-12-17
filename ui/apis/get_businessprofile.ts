

export type BusinessProfile = {
    description: string;
    date_created: string;
    address: string;
}


export async function GetBusinessProfile(server: string, cookie: string, businessName?: string): Promise<BusinessProfile | Error> {
    let error: Error | null = null
    let business: BusinessProfile = {
        description: "",
        date_created: "",
        address: "",
    }

    let url = `${server}/api/business-profile`
    if (businessName) {
        url = url + `?business=${businessName}`
    }

    await fetch(url, {
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
        }).then((data: BusinessProfile) => {
            business = data
        })
        .catch((err: Error) => {
            error = err
        });

    if (error) {

        return error
    }

    return business
}

