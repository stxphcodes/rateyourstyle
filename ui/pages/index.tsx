import { GetServerSideProps } from 'next';
import { useState, useEffect } from 'react';
import Link from 'next/link';

import { Campaign, GetCampaigns } from '../apis/get_campaigns';
import { GetOutfits, GetPublicOutfitsByUser, Outfit, OutfitItem } from '../apis/get_outfits';
import { GetRatings, Rating } from '../apis/get_ratings';
import { Footer } from '../components/footer';
import { Navbar } from '../components/navarbar';
import { OutfitCard } from '../components/outfitcard';
import { GetServerURL } from "../apis/get_server";
import { ClosetTable } from '../components/closet-table';
import { PageMetadata } from './_app';
import { GetBusinesses } from '../apis/get_businesses';

type Props = {
    campaigns: Campaign[] | null;
    cookie: string;
    clientServer: string;
    error: string | null;
    outfits: Outfit[] | null;
    outfitsForTable: Outfit[] | null;
    userRatings: Rating[] | null;
    metadata: PageMetadata;
    businesses: string[] | null;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    let props: Props = {
        campaigns: null,
        cookie: "",
        userRatings: null,
        error: null,
        outfits: null,
        outfitsForTable: null,
        clientServer: "",
        businesses: [],
        metadata: {
            title: "",
            description: "Get style feedback on Rate Your Style through outfit reviews and keep track of the clothes you wear through our virtual closet, a database-like table that takes inventory of your clothes and uses data science to create graphs about your closet."
        }
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
        const ratingResp = await GetRatings(server, props.cookie);
        if (ratingResp instanceof Error) {
            props.error = ratingResp.message;
            return { props };
        }
        props.userRatings = ratingResp;
    }

    const campaignResp = await GetCampaigns(server);
    if (campaignResp instanceof Error) {
        props.error = campaignResp.message;
        return { props };
    }
    props.campaigns = campaignResp;

    const businessResp = await GetBusinesses(server, props.cookie);
    if (businessResp instanceof Error) {
        props.error = businessResp.message;
        return { props };
    }
    props.businesses = businessResp;

    const outfitResp = await GetOutfits(server, 8);
    if (outfitResp instanceof Error) {
        props.error = outfitResp.message;
        return { props };
    }
    props.outfits = outfitResp;

    let sampleCloset="stxphcodes"
    if (process.env.NODE_ENV == "development") {
        sampleCloset = "test1234"
    }

    const userOutfits = await GetPublicOutfitsByUser(server, props.cookie, sampleCloset);
    if (userOutfits instanceof Error) {
        props.error = userOutfits.message;
        return { props };
    }
    props.outfitsForTable = userOutfits;


    const clientServer = GetServerURL(true);
    if (clientServer instanceof Error) {
        props.error = clientServer.message;
        return { props };
    }
    props.clientServer = clientServer;

    return { props };
};

function Home({ campaigns, cookie, outfits, outfitsForTable, userRatings, clientServer, businesses, error }: Props) {
    const [heroSectionImage, setHeroSectionImage] = useState(outfits ? outfits[0].picture_url : "/clothing-photo.jpg")

    let outfitItems: OutfitItem[] = [];

    outfits && outfits.map(outfit => {
        outfit.items && outfit.items.map(item => {
            outfitItems.push(item);
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


    useEffect(() => {
        const id = setInterval(() => {
            if (outfits) {
                let num = Math.floor(Math.random() * (outfits.length));
                setHeroSectionImage(outfits[num].picture_url)
            }

        }, 3000)

        return () => clearInterval(id);

    }, [])


    if (error) {
        return <div>error {error} </div>;
    }

    return (
        <>
            <Navbar clientServer={clientServer} cookie={cookie} />
            <main className="mt-12 sm:mt-20">

                <section className="px-3 md:px-8 mb-8">
                    <h1>For the Fashion Conscious</h1>
                    <h6 className="py-2 text-sm md:text-base text-balance">
                        RateYourStyle is for the fashion conscious who are intentional with the clothes they purchase and wear.  Engage in fashion discourse with other users through outfit reviews, and practice closet mindfulness by reviewing your own clothing items.{" "}
                        <Link href="discover">Discover more here</Link>
                    </h6>
                    <div className="flex flex-nowrap flex-row gap-4 overflow-scroll my-2">
                        {outfits &&
                            outfits.map((item) => {
                                let userRating: Rating | null = null
                                if (userRatings) {
                                    userRating = userRatings?.filter(r => r.outfit_id == item.id)[0]
                                }

                                return (
                                    <div className="flex-none" key={item.id}>
                                        <OutfitCard
                                            cookie={cookie}
                                            data={item}
                                            userRating={userRating}
                                            clientServer={clientServer}
                                            verifiedBusiness={businesses && businesses.filter(id => item.username == id).length > 0 ? true : false}
                                        />
                                    </div>
                                )
                            })}
                    </div>
                </section>
                <section className="bg-background-2 px-3 md:px-8 py-8">
                    <h1 className="text-white">For the Fashion Nerd</h1>
                    <h6 className="my-4 text-white text-base">
                        Is loud budgeting one of your &quot;ins&quot; this year? <br />
                        The virtual closet feature of RateYourStyle aggreates your clothes into a database-like table and uses data science to visualize your closet data into meaningful graphs.
                    </h6>
                    <div className="bg-white p-2 rounded-lg">


                        <h6>Sample Closet</h6>
                        <ClosetTable outfits={outfitsForTable ? outfitsForTable : []} cookie={cookie} clientServer={clientServer} userRatings={null} onlyTable={true} />
                    </div>
                </section>
                <section className="bg-white px-3 md:px-8 my-4">
                    <h1>Get Started</h1>
                    <div className="my-4">
                        RateYourStyle is completely free to use. As a programmer who is interested in fashion, I work on this as a side project because it helps me practice coding, and (this is the real reason) it gives me an excuse to buy clothes and dress up 💃🏻. If you&apos;re interested in joining our little community, please hit the{" "}<span className="text-primary">Create an Account</span>{" "}button on the navbar.
                    </div>

                    <div className="mt-8">
                        <h1>Privacy</h1>
                        <div>We value your privacy. That&apos;s why each outfit post has its own visibility setting and your closet will only display clothing items from public outfit posts. Private outfits and its clothing items can only be viewed by you and the sponsor of a campaign if it uses a campaign #tag. <br /><br />

                            RateYourStyle also uses cookies to maintain your login session. The cookie is only used for the purpose of saving your login details.
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}

export default Home;
