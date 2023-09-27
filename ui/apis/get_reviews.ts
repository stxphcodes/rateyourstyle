

export type Review = {
    UserId: string;
    OutfitId: string; 
    Rating: any;
}

export async function GetReviews(): Promise<Review[] | Error> { 
    let error: Error | null = null 
    let reviews: Review[] = []

    await fetch("http://localhost:8000/reviews", {
        method: "GET",
        headers: {
            'content-type': "application/json",
        },
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("response not ok");
            }

            return response.json()
        }).then(data => {
            reviews = data
        })
        .catch((err: Error) => {
            error = err
        });

    if (error) {
        return error
    }

    return reviews
}