export type Campaign= {
    tag: string; 
    date_starting: string; 
    date_ending: string; 
    ended: boolean; 
    description: string;
    background_img: string; 
  };

  
  export async function GetCampaigns(): Promise<Campaign[] | Error> {
    let error: Error | null = null;
    let campaigns: Campaign[] = [];
  
    await fetch("http://localhost:8000/campaigns")
      .then((response) => {
        if (!response.ok) {
          throw new Error("response not ok");
        }
  
        return response.json();
      })
      .then((data: Campaign[]) => {
        campaigns = data;
      })
      .catch((err: Error) => {
        error = err;
      });
  
    if (error) {
      return error;
    }
  
    return campaigns;
  }
  