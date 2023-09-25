import {GetServerSideProps} from 'next';
import {useState} from 'react';

import {Navbar} from '../components/navarbar';

import { Campaign, GetCampaigns } from '../apis/get_campaigns';



type Props = {
    campaigns: Campaign[] | null;
    cookie: string;
    error: string | null;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    let props: Props = {
        campaigns: null,
        cookie: "",
        error: null,
    };

    let cookie = context.req.cookies["rys-login"];
    props.cookie = cookie ? cookie : "";

    const resp = await GetCampaigns();
    if (resp instanceof Error) {
        props.error = resp.message;
        return {props};
    }

    props.campaigns = resp;

  

    return {props};
};

function Campaigns({campaigns, cookie,  error}: Props) {


    return (
        <>
            <Navbar cookie={cookie} />

            <main className="mt-6 p-8">
                <section className="my-4">
                    <h1>Campaigns</h1>
                    <div className="">
                         RateYourStyle partners with companies to create campaigns that help showcase your style. Check out the active campaigns below. To apply for a campaign, you just need to Post an Outfit according to the requirements listed in the campaign, and to tag the outfit with the campaign tag. Please note that both public and private posts are shared with the sponsor of the campaign, however only public posts get displayed on the homepage and are search-able by the public. 
                    </div>

                </section>

                <section className="my-8">
                    <h1>Active Campaigns</h1>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                        {campaigns?.map((item) => (
                            <div
                                className={`w-full h-40 text-white p-4 rounded-lg h-fit` }
                                style={{backgroundColor: `${item.background_img}`}}
                                key={item.tag}     
                            >
                                <h2>{item.tag}</h2>
                                <p>{item.description}</p>
                            </div>
                        ))}
                    </div>

                
                </section>

                <section>
                    
                </section>
            </main>
        </>
    );
}

export default Campaigns;
