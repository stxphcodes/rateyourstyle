import { GetServerSideProps } from 'next';
import { useState, useEffect } from 'react';
import Link from "next/link";

import { Campaign, GetCampaigns } from '../apis/get_campaigns';
import { GetOutfits, Outfit } from '../apis/get_outfits';
import { GetRatings, Rating } from '../apis/get_ratings';
import { Footer } from '../components/footer';
import { Navbar } from '../components/navarbar';
import { OutfitCard } from '../components/outfitcard';
import { GetServerURL } from "../apis/get_server";

type Props = {
    campaigns: Campaign[] | null;
    cookie: string;
    clientServer: string;
    error: string | null;
    outfits: Outfit[] | null;
    ratings: Rating[] | null;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    let props: Props = {
        campaigns: null,
        cookie: "",
        ratings: null,
        error: null,
        outfits: null,
        clientServer:"",
    };

    let server = GetServerURL()
    if (server instanceof Error) {
        props.error = server.message; 
        return {props};
    }

    if (context.req.cookies["rys-login"]) {
        props.cookie = context.req.cookies["rys-login"];
    }

    const campaignResp = await GetCampaigns(server);
    if (campaignResp instanceof Error) {
        props.error = campaignResp.message;
        return { props };
    }
    props.campaigns = campaignResp;

    const outfitResp = await GetOutfits(server);
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
    if (clientServer instanceof Error ) {
        props.error = clientServer.message;
        return { props };
    }
    props.clientServer = clientServer;

    return { props };
};

function Home({ campaigns, cookie, outfits, ratings, clientServer, error }: Props) {
    const [searchTerms, setSearchTerms] = useState<string[]>([]);
    const [readMore, setReadMore] = useState(() => {
        let intialState =
            campaigns &&
            campaigns.map((item) => ({
                tag: item.tag,
                readMore: false,
            }));

        return intialState;
    });

    const [outfitsFiltered, setOutfitsFiltered] = useState<Outfit[] | null>(outfits);

    useEffect(() => {
        if (searchTerms.length == 0) {
            setOutfitsFiltered(outfits)
            return
        }

        let filtered: Outfit[] = []
        outfits?.forEach(outfit => {
            let tagFound = false
            outfit.style_tags.forEach(tag => {
                if (searchTerms.includes(tag)) {
                    tagFound = true
                    return;
                }
            })

            if (tagFound) {
                filtered.push(outfit)
            }
        })

        setOutfitsFiltered(filtered)

    }, [searchTerms])

    if (error) {
        return <div>error {error} </div>;
    }

    return (
        <>
            <Navbar clientServer={clientServer} cookie={cookie} />
            <main className="mt-6 p-8">
                <section className="my-4">
                    <h1>Welcome to Rate Your Style</h1>
                    <div className="">
                        A fashion site for style inspo, clothing links and outfit reviews. Check out currently active <Link href="/campaigns"><a className="text-pink underline">campaigns</a></Link> and win up to $500 in gift cards to fashion brands of your choice by <Link href="/post-outfit"><a className="underline text-pink">Posting an Outfit</a></Link>. 
                    </div>
                </section>

                <section className="my-4">
                    <h1>Discover</h1>
                    <div className="mb-4">
                        Click on a campaign hashtag to see the public outfits that have been uploaded for it so far. To rate an outfit, click on &apos;submit your rating&apos; in the outfit card.
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        {campaigns?.map((item) => (
                            <div
                                className={`w-full  text-white p-2 rounded-lg h-fit `}
                                style={{ backgroundColor: `${item.background_img}` }}
                                key={item.tag}
                            >
                                <div className="flex gap-2 items-center">
                                    <h3
                                        className="hover:cursor-pointer"
                                        onClick={() => {
                                            setSearchTerms([...searchTerms, item.tag]);
                                        }}
                                    >
                                        {item.tag}
                                    </h3>
                                    <input type="checkbox" onChange={() => {
                                        let checked = searchTerms.filter(term => item.tag == term).length > 0

                                        setSearchTerms(
                                            searchTerms.filter((term) => term !== item.tag)
                                        );

                                        if (checked) {
                                            setSearchTerms(
                                                searchTerms.filter((term) => term !== item.tag)
                                            );
                                        } else {
                                            setSearchTerms([...searchTerms, item.tag])
                                        }

                                    }} checked={searchTerms.filter(term => item.tag == term).length > 0}></input>
                                </div>
                                <p className="mb-2">Ends: {item.date_ending}</p>
                                {readMore?.filter((i) => i.tag == item.tag)[0].readMore && (
                                    <p className="mb-4">{item.description}</p>
                                )}
                                <button
                                    className="px-1 bg-white opacity-40 rounded text-pink hover:cursor-pointer"
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
                                      
                                       
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    {
                        (!outfitsFiltered || outfitsFiltered.length == 0) &&
                        <div className="h-screen">No results at this time </div>
                    }

                    {outfitsFiltered &&
                        outfitsFiltered.map((item) => {
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
                                <OutfitCard
                                    cookie={cookie}
                                    asUser={false}
                                    data={item}
                                    key={item.id}
                                    ratings={outfitRatings}
                                    userRating={userRating}
                                    clientServer={clientServer}
                                />
                            )
                        })}
                </section>
            </main>
            <Footer />
        </>
    );
}

export default Home;
