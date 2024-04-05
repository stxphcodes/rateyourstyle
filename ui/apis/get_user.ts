export type UserNotifResp = {
    username: string;
    has_notifications: boolean;
}

export async function GetUsernameAndNotifications(server: string, cookie: string): Promise<UserNotifResp | Error> {
    let error: Error | null = null
    let resp: UserNotifResp = {
        username: "",
        has_notifications: false,
    }

    await fetch(`${server}/api/username-notifications`, {
        method: "GET",
        headers: {
            'content-type': "application/json",
            'rys-login': cookie,
        },
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("response not ok");
            }

            return response.json()
        }).then((data: UserNotifResp) => {
            resp = data

        })
        .catch((err: Error) => {
            error = err
        });

    if (error) {
        return error
    }

    return resp
}


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
    user_profile: UserProfile;
    user_general?: UserGeneral;
}

export type UserProfile = {
    department: string;
    age_range: string;
    weight_range: string;
    height_range: string;
}

export type UserGeneral = {
    description: string;
    aesthetics: string[];
    links: string[];
    country: string;
}

export async function GetUser(server: string, cookie: string, username: string): Promise<User | Error> {
    let error: Error | null = null
    let user: User = {
        username: "",
        email: "",
        user_profile: {
            department: "",
            age_range: "",
            weight_range: "",
            height_range: ""
        },
        user_general: {
            description: "",
            aesthetics: [],
            links: [],
            country: "",
        }
    }

    await fetch(`${server}/api/user/${username.toLowerCase()}`, {
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