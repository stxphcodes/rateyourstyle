export async function PostSearch(
    server: string,
    cookie: string,
    term: string,
): Promise<Error | string[]> {
    let error: Error | null = null
    let replies: string[] = []
    
    await fetch(`${server}/search`, {
        method: "POST",
        body: JSON.stringify({
            term: term,
        }),
        headers: {
            "content-type": "application/json",
            "rys-login": cookie
        },
    }).then((response) => {
        if (!response.ok) {
            throw new Error("response not ok");
        }

        return response.json()

    }).then((data: string[]) => {
        replies = data;
      
    }).catch((err: Error) => {
        error = err
    });

    if (error) {
        return error
    }

    return replies
}