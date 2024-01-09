export type Notification = {
    id: string;
    for_outfit_id: string;
    for_outfit_title: string;
    for_user_id: string;
    for_username: string;
    from_user_id: string;
    from_username: string;
    date: string;
    message: string;
    seen_at: string;
    seen: boolean;
}

export async function GetNotifications(server: string, cookie: string): Promise<Notification[] | Error> {
    let error: Error | null = null
    let resp: Notification[] = []

    await fetch(`${server}/api/notifications`, {
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
        }).then((data: Notification[]) => {
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