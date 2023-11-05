import { GetServerSideProps } from 'next';
import { useState, useEffect } from 'react';
import Link from 'next/link';

import { Campaign, GetCampaigns } from '../apis/get_campaigns';
import { GetOutfits, Outfit, OutfitItem } from '../apis/get_outfits';
import { GetRatings, Rating } from '../apis/get_ratings';
import { Footer } from '../components/footer';
import { Navbar } from '../components/navarbar';
import { OutfitCardMinimum } from '../components/outfitcard-minimum';
import { GetServerURL } from "../apis/get_server";
import { GetUserProfile, User, UserProfile } from '../apis/get_user';
import { ChartIcon } from '../components/icons/chart';
import { ClosetTable } from '../components/closet-table';

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

    const outfitResp = await GetOutfits(server, 8);
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

    let outfitItems: OutfitItem[] = [];

    outfits && outfits.map(outfit => {
        outfit.items.map(item => {
            // if (!outfitItemToIds.has(item.description)) {
            outfitItems.push(item);
            //     outfitItemToIds.set(item.description, [outfit.id]);
            // } else {
            //     let outfitIds = outfitItemToIds.get(item.description) || [];
            //     outfitIds.push(outfit.id)
            //     outfitItemToIds.set(item.description, outfitIds);
            // }
        })
    })

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
            <main className="mt-6 ">
                <section className="bg-primary text-white ">
                    <div className="grid grid-cols-1 md:grid-cols-5 items-center gap-x-0 md:gap-x-8">
                        <div className="col-span-3 px-3 md:px-8 py-16"><h1 >Welcome to Rate Your Style</h1><div className="text-xl mt-4">For the everyday fashion enthusiast who likes to be chic, organized and mindful of what&apos;s in their closet.</div></div>
                        <img src="/clothing-photo.jpg" className="md:col-span-2 w-full h-auto"></img>

                    </div>

                 
                </section>
                <section className="my-8 px-3 md:px-8">
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
                                    <div className="flex-none" key={item.id}>
                                        <OutfitCardMinimum
                                            cookie={cookie}
                                            data={item}
                                            ratings={outfitRatings}
                                            userRating={userRating}
                                            clientServer={clientServer}
                                        />
                                    </div>
                                )
                            })}

                    </div>
                </section>

                <section className="mt-4 bg-primary  px-3 md:px-8 py-8">
                    <h2 className="text-white">Take Inventory of Your Closet</h2>
                    <div className="my-4 text-white">
                        RateYourStyle will aggregate all of the clothing items in your outfits to create an inventory of your closet. You can sort, filter and search for items easily with our spreadsheet-like table. Features to come include: more data science tools to enable meaningful analysis of your closet, an AI style assistant and more.
                    </div>
                    <div>
                        <ClosetTable outfitItems={outfitItems} itemsSelected={null} handleItemSelection={null} />
                    </div>

                </section>

                <section className="bg-white px-3 md:px-8 py-8 ">
                    <h2>Campaigns</h2>
                    <div className="my-4">
                        RateYourStyle partners with local boutiques and brands to create campaigns that celebrate, reward and showcase our users&apos; style and fashion. Typically, at the end of the campaign, a few posts will be selected to win $100 gift cards. To apply to an active campaign, <Link href="/post-outfit">Post an Outfit</Link> according to the requirements listed in the campaign, and tag the outfit with the campaign #tag. Winners of campaigns will be notified by email, so be sure to create an account before posting.
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

                        Creating a campaign on RateYourStyle is a direct way for your company to engage with and give back to the loyal consumers of your brand. A campaign is also a great way to conduct market research and doubles as a form of advertisement. If you&apos;re interested in starting a campaign on RateYourStyle, please send us an email: sitesbystephanie@gmail.com.
                    </div>
                </section>

                <section className="mt-4 bg-primary text-white px-3 md:px-8 py-4">
                    <h2>Privacy</h2>
                    <div>We value your privacy. That&apos;s why each outfit post has its own visibility setting and your closet will only display clothing items from public outfit posts. Private outfits and its clothing items can only be viewed by you and the sponsor of a campaign if it uses a campaign #tag. <br /><br />

                        RateYourStyle also uses cookies to maintain your login session. The cookie is only used for the purpose of saving your login details.
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}

export default Home;
