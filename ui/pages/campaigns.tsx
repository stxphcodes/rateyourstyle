import { GetServerSideProps } from 'next';

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
                        <a className="text-pink underline" href="/post-outfit">
                            Post an Outfit
                        </a>{" "}
                        according to the requirements listed in the campaign, and tag the
                        outfit with the campaign tag. Please note that both public and
                        private posts are shared with the sponsor of the campaign, however
                        only public posts get displayed on the homepage and are search-able
                        by the public. Winners of campaigns with prizes will be notified by email.
                    </div>
                </section>

                <section className="my-8">
                    <h1>Active Campaigns</h1>

                    {/* {campaigns?.map((item) => (
                            <div
                                className={`w-3/4  shadow rounded-lg h-fit my-2 `}
                                // style={{color: `${item.background_img}`}}
                                key={item.tag}
                            >
                                <h2 className="p-2 text-white rounded" style={{backgroundColor: `${item.background_img}`}}>{item.tag}</h2>
                                <p className="p-2"> Ends on: {item.date_ending}</p>
                                <p className="mt-4 p-2">{item.description}</p>
                            </div>
                        ))} */}

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

                    {/* <div className="grid grid-cols-2 gap-4 mt-4">
                        {campaigns?.map((item) => (
                            <div
                                className={`w-full h-40 text-white p-4 rounded-lg h-fit`}
                                style={{backgroundColor: `${item.background_img}`}}
                                key={item.tag}
                            >
                                <h2>{item.tag}</h2>
                                <p>Ends on: {item.date_ending}</p>
                                <p className="mt-4">{item.description}</p>
                            </div>
                        ))}
                    </div> */}
                </section>
                <section>
                    <h1>Create a Campaign</h1>
                    <div>Creating a campaigns on RateYourStyle is a direct way for your company to engage with and give back to the loyal consumers of your brand. A campaign is also ideal for market research and as a form of advertisement for your brand. <br />If you're interested in a campaign on RateYourStyle, or if you'd like to learn more, please fill out this form.</div>

                </section>
            </main>
            <Footer />
        </>
    );
}

export default Campaigns;
