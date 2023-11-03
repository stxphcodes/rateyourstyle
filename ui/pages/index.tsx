import { GetServerSideProps } from 'next';
import { useState, useEffect } from 'react';
import Link from "next/link";

import { Campaign, GetCampaigns } from '../apis/get_campaigns';
import { GetOutfits, Outfit } from '../apis/get_outfits';
import { GetRatings, Rating } from '../apis/get_ratings';
import { Footer } from '../components/footer';
import { Navbar } from '../components/navarbar';
import { OutfitCardMinimum } from '../components/outfitcard-minimum';
import { GetServerURL } from "../apis/get_server";
import { GetUserProfile, User, UserProfile } from '../apis/get_user';
import { ChartIcon } from '../components/icons/chart';

type Props = {
    campaigns: Campaign[] | null;
    cookie: string;
    clientServer: string;
    error: string | null;
    outfits: Outfit[] | null;
    ratings: Rating[] | null;
    user: User | null;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    let props: Props = {
        campaigns: null,
        cookie: "",
        user: null,
        ratings: null,
        error: null,
        outfits: null,
        clientServer: "",
    };

    let server = GetServerURL()
    if (server instanceof Error) {
        props.error = server.message;
        return { props };
    }

    if (context.req.cookies["rys-login"]) {
        props.cookie = context.req.cookies["rys-login"];
    }

    if (props.cookie) {
        const userResp = await GetUserProfile(server, props.cookie);
        if (userResp instanceof Error) {
            props.error = userResp.message;
            return { props };
        }

        props.user = userResp;
    }

    const campaignResp = await GetCampaigns(server);
    if (campaignResp instanceof Error) {
        props.error = campaignResp.message;
        return { props };
    }
    props.campaigns = campaignResp;

    const outfitResp = await GetOutfits(server, 10);
    if (outfitResp instanceof Error) {
        props.error = outfitResp.message;
        return { props };
    }
    props.outfits = outfitResp;

    const ratingResp = await GetRatings(server);
    if (ratingResp instanceof Error) {
        props.error = ratingResp.message;
        return { props };
    }
    props.ratings = ratingResp;

    const clientServer = GetServerURL(true);
    if (clientServer instanceof Error) {
        props.error = clientServer.message;
        return { props };
    }
    props.clientServer = clientServer;

    return { props };
};

function Home({ campaigns, cookie, user, outfits, ratings, clientServer, error }: Props) {

    const [readMore, setReadMore] = useState(() => {
        let intialState =
            campaigns &&
            campaigns.map((item) => ({
                tag: item.tag,
                readMore: false,
            }));

        return intialState;
    });

    if (error) {
        return <div>error {error} </div>;
    }

    return (
        <>
            <Navbar clientServer={clientServer} cookie={cookie} user={user?.username} />
            <main className="mt-6 p-3 md:p-8">
                <section className="-mx-8 px-8 py-8 bg-primary text-white">

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                        <div className="col-span-2">
                            <h1>Welcome to Rate Your Style</h1>
                            <div className="mt-4">
                                Launched in Oct 2023, RateYourStyle is for the everyday fashion enthusiast who likes to be chic, organized, and mindful of what's in their closet.  Use RateYourStyle to post outfits and share your thoughts about each clothing item. Every item in an outfit post will then populate a spreadsheet-like table to help you track and sort what's in your closet. Finally, check out how you can get rewarded for your style by reading more about campaigns below. <br /><br />
                                (For our data-loving fashionistas, we plan to make the table more interactive in the future so you can analyze what's in your closet 🤓)
                            </div>
                        </div>
                        <div className="">
                            <div className="relative inline-block">
                                <img className="shadow-lg rounded bg-white p-1 w-72 block" src="/table-screenshot.png"></img>
                                <div className="absolute m-0 top-1/2 left-1/2  -translate-x-1/2 -translate-y-1/2"><ChartIcon /></div>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="my-4 ">
                    <h2>Find style inspo, get clothing links, and read outfit reviews</h2>
                    <Link href="discover">Discover more here</Link>
                    <div className="flex flex-nowrap flex-row gap-2 overflow-scroll">
                        {outfits &&
                            outfits.map((item) => {
                                let outfitRatings = ratings ?
                                    ratings.filter((r) => r.outfit_id == item.id) :
                                    null

                                let userRatingFiltered = outfitRatings ? outfitRatings.filter(r => r.cookie == cookie) : null

                                let userRating = 0
                                if (
                                    userRatingFiltered &&
                                    userRatingFiltered.length > 0
                                ) {
                                    userRating = userRatingFiltered[0].rating
                                }

                                return (
                                    <div className="flex-none">
                                        <OutfitCardMinimum
                                            cookie={cookie}

                                            data={item}
                                            key={item.id}
                                            ratings={outfitRatings}
                                            userRating={userRating}
                                            clientServer={clientServer}
                                        />
                                    </div>
                                )
                            })}

                    </div>
                </section>

                <section className="my-4 bg-primary -mx-8 px-8 py-8 text-white">
                    <h2>Campaigns</h2>
                    <div className="my-4">
                        RateYourStyle partners with local boutiques and brands to create campaigns that celebrate, reward and showcase our users' style and fashion. Typically, at the end of the campaign, a few posts will be selected to win $100 gift cards. To apply to an active campaign, <Link href="/post-outfit"><span className="text-white underline hover:cursor-pointer hover:text-black">Post an Outfit</span></Link> according to the requirements listed in the campaign, and tag the outfit with the campaign #tag. Please note that both public and private posts are shared with the sponsor of the campaign, however only public posts are displayed on the Discover page. Winners of campaigns will be notified by email, so be sure to create an account before posting.
                    </div>
                    <h6>Active Campaigns:</h6>
                    <div className="flex flex-wrap justify-start items-start gap-2 mt-4">
                        {campaigns?.map((item) => (
                            <div
                                className={`text-white p-2 rounded-lg h-fit w-48`}
                                style={{ backgroundColor: `${item.background_img}` }}
                                key={item.tag}
                            >
                                <div>
                                    {item.tag}
                                </div>
                                <div className="text-xs">Ends: {item.date_ending}</div>
                                {readMore?.filter((i) => i.tag == item.tag)[0].readMore && (
                                    <p className="mb-4 text-xs">{item.description}</p>
                                )}
                                <a
                                    className="text-white text-xs"
                                    onClick={() => {
                                        readMore?.forEach((i, index) => {
                                            if (i.tag == item.tag) {
                                                let copy = [...readMore];
                                                copy[index].readMore = !copy[index].readMore;
                                                setReadMore(copy);
                                                return;
                                            }
                                        });
                                    }}
                                >
                                    Read{" "}
                                    {readMore?.filter((i) => i.tag == item.tag)[0].readMore
                                        ? "less"
                                        : "more"}
                                </a>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4"> 
             
                                Creating a campaign on RateYourStyle is a direct way for your company to engage with and give back to the loyal consumers of your brand. A campaign is also a great way to conduct market research and doubles as a form of advertisement. If you're interested in starting a campaign on RateYourStyle, please send us an email: sitesbystephanie@gmail.com.
                    </div>
                </section>

                <section className="mt-4">
                    <h2>Privacy</h2>
                    <div>We value your privacy at RateYourStyle. That's why each outfit post has its own "visibility" setting, so that you can decide which outfits you'd like to be discover-able by the public. Likewise, the link that you use to share your closet will only display clothing items from public outfit posts as well. Private outfits and it's clothing items can only be viewed by you. However, if a prviate outfit uses a campaign #tag, then the campaign sponsor can view the outfit as well. <br /><br />

                        RateYourStyle also uses cookies to maintain your login session. The cookie is only used for the purpose of saving your login details.
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}

export default Home;
