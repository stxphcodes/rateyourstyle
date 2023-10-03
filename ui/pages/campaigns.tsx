import { GetServerSideProps } from 'next';
import Link from 'next/link';

import { Campaign, GetCampaigns } from '../apis/get_campaigns';
import { Footer } from '../components/footer';
import { Navbar } from '../components/navarbar';
import { GetServerURL } from '../apis/get_server';

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

    const server = GetServerURL()

    let cookie = context.req.cookies["rys-login"];
    props.cookie = cookie ? cookie : "";

    const resp = await GetCampaigns(server);
    if (resp instanceof Error) {
        props.error = resp.message;
        return {props};
    }
    props.campaigns = resp;

    return {props};
};

function Campaigns({campaigns, cookie, error}: Props) {
    return (
        <>
            <Navbar cookie={cookie} />

            <main className="mt-6 p-8">
                <section className="my-4">
                    <h1>Campaigns</h1>
                    <div className="">
                        RateYourStyle partners with companies to create campaigns that help
                        showcase your style.

                        To apply to an active campaign,{" "}
                        <Link  href="/post-outfit">
                            <a className="text-pink underline">Post an Outfit</a> 
                        </Link>{" "}
                        according to the requirements listed in the campaign, and tag the
                        outfit with the campaign tag. Please note that both public and
                        private posts are shared with the sponsor of the campaign, however
                        only public posts get displayed on the homepage and are search-able
                        by the public. Winners of campaigns with prizes will be notified by email.
                    </div>
                </section>

                <section className="my-4">
                    <h1>Active Campaigns</h1>

                    {campaigns?.map((item) => (
                        <div
                            className={`w-3/4 h-40 text-white p-4 rounded-lg h-fit my-2`}
                            style={{backgroundColor: `${item.background_img}`}}
                            key={item.tag}
                        >
                            <h2>{item.tag}</h2>
                            <p>Ends on: {item.date_ending}</p>
                            <p className="mt-4">{item.description}</p>
                        </div>
                    ))}
                </section>
                <section>
                    <h1>Create a Campaign</h1>
                    <div>Creating a campaign on RateYourStyle is a direct way for your company to engage with and give back to the loyal consumers of your brand. A campaign is also a great way to conduct market research and doubles as a form of advertisement. If you&apos;re interested in starting a campaign on RateYourStyle, please contact us at sitesbystephanie@gmail.com.</div>

                </section>
            </main>
            <Footer />
        </>
    );
}

export default Campaigns;
