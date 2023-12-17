export type BusinessOutfitSelected = {
    outfit_id: string;
    item_ids: string[];
}

export async function PostBusinessOutfits(
  server: string,
  cookie: string,
  businessOutfits: BusinessOutfitSelected[],
  businessName: string,
): Promise<Error | null> {
  let error: Error | null = null



  await fetch(`${server}/api/business-outfits?business=${businessName}`, {
      method: "POST",
      body: JSON.stringify(businessOutfits),
      headers: {
          "content-type": "application/json",
          "rys-login": cookie
      },
  }).then((response) => {
      if (!response.ok) {
          throw new Error("response not ok");
      }
  }).catch((err: Error) => {
      error = err
  });

  return error
}