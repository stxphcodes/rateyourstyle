import { GetServerSideProps } from 'next';
import { useEffect, useState } from 'react';

import { GetBusinesses } from '../apis/get_businesses';
import { Campaign, GetCampaigns } from '../apis/get_campaigns';
import { GetOutfits, Outfit } from '../apis/get_outfits';
import { GetRatings, Rating } from '../apis/get_ratings';
import { GetServerURL } from "../apis/get_server";
import { GetUserProfile, User, UserProfile } from '../apis/get_user';
import { Footer } from '../components/footer';
import { AccountPromptModal } from '../components/modals/accountPrompt';
import { Navbar } from '../components/navarbar';
import { OutfitCard } from '../components/outfitcard';
import { PageMetadata } from './_app';

type Props = {
    campaigns: Campaign[] | null;
    cookie: string;
    clientServer: string;
    error: string | null;
    outfits: Outfit[] | null;
    userRatings: Rating[] | null;
    metadata: PageMetadata;
    businesses: string[];
    user: User | null;
};

function checkEmptyUserProfile(profile: UserProfile) {
    if (!profile) {
        return true
    }

    if (profile.age_range == "" && profile.department == "" && profile.height_range == "" && profile.weight_range == "") {
        return true
    }

    return false
}

function findSimilarToMe(outfitUser: UserProfile, user: UserProfile) {
    if (user.age_range !== "") {
        if (outfitUser.age_range !== user.age_range) {
            return false
        }
    }

    if (user.department !== "") {
        if (outfitUser.department !== user.department) {
            return false
        }
    }

    if (user.height_range !== "") {
        if (outfitUser.height_range !== user.height_range) {
            return false
        }
    }

    if (user.weight_range !== "") {
        if (outfitUser.weight_range !== user.weight_range) {
            return false
        }
    }

    return true
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    let props: Props = {
        campaigns: null,
        cookie: "",
        userRatings: null,
        error: null,
        outfits: null,
        clientServer: "",
        businesses: [],
        user: null,
        metadata: {
            title: "Discover",
            description: "Discover fashion inspo, like new clothing brands and outfit ideas on RateYourStyle."
        },

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

        const userProfileResp = await GetUserProfile(server, props.cookie)
        if (!(userProfileResp instanceof Error)) {
           props.user = userProfileResp
        }
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

    const businessResp = await GetBusinesses(server, props.cookie);
    if (businessResp instanceof Error) {
        props.error = businessResp.message;
        return { props };
    }
    props.businesses = businessResp;

    const clientServer = GetServerURL(true);
    if (clientServer instanceof Error) {
        props.error = clientServer.message;
        return { props };
    }
    props.clientServer = clientServer;

    // sort outfits by date
    props.outfits.sort((a, b) => a.date < b.date ? 1 : -1);


    return { props };
};

function DiscoverPage({ campaigns, cookie, user, userRatings, outfits, clientServer, businesses, error }: Props) {
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

    const [similarToMe, setSimilarToMe] = useState<boolean>(false);
    const [similarToMeError, setSimilarToMeError] = useState<string | null>(null);

    const [outfitsFiltered, setOutfitsFiltered] = useState<Outfit[] | null>(outfits);

    useEffect(() => {
        if (searchTerms.length == 0 && !similarToMe) {
            setOutfitsFiltered(outfits)
            return
        }

        let filtered: Outfit[] = []
        outfits?.forEach(outfit => {
            let include = false
            outfit.style_tags.forEach(tag => {
                if (searchTerms.includes(tag)) {
                    include = true
                    return;
                }
            })

            if (include) {
                filtered.push(outfit)
                return;
            }

            if (similarToMe && user && user.user_profile) {
                if (outfit?.user_profile) {
                    if (findSimilarToMe(outfit.user_profile, user.user_profile)) {
                        filtered.push(outfit);
                    }
                }
            }
        })

        setOutfitsFiltered(filtered)
    }, [searchTerms, similarToMe])

    if (error) {
        return <div>error {error} </div>;
    }


    return (
        <>
            <Navbar clientServer={clientServer} cookie={cookie} />
            {
                !cookie && 
                <AccountPromptModal clientServer={clientServer}/>
            }
            <main className="mt-12 sm:mt-20 px-4 md:px-8 overflow-y-hidden">
                <section className="mb-4">
                    <h1>Discover</h1>
                    <div>Select a username to see the user&apos;s closet. Submit a rating for an outfit by clicking &apos;submit your rating&apos;.</div>
                    <div className="mb-2">Select the filter(s) below to see matching outfits.</div>
                    <div className="flex flex-wrap justify-start items-start gap-2">
                        <div className="bg-black text-white p-2 rounded w-60">
                            <div className="flex gap-2 items-center">
                                Similar to me
                                <input type="checkbox"
                                    onChange={() => {
                                        if (!user || !user.username) {
                                            setSimilarToMeError("unknownUser")
                                            return;
                                        }

                                        if (checkEmptyUserProfile(user.user_profile)) {
                                            setSimilarToMeError("missingProfile")
                                            return;
                                        }

                                        setSimilarToMe(!similarToMe)
                                    }}
                                    checked={similarToMe}>
                                </input>

                            </div>
                            <div className="text-xs">Discover outfits from users that are similar in age, height, and weight.
                            </div>
                            {similarToMeError &&
                                <div className="text-primary">{similarToMeError == "unknownUser" ? "You must be signed into an account to use this filter." : similarToMeError == "missingProfile" && "You must complete your user profile to use this filter."}</div>
                            }
                        </div>

                        {campaigns?.map((item) => (
                            <div
                                className={`text-white p-2 rounded-lg h-fit w-48`}
                                style={{ backgroundColor: `${item.background_img}` }}
                                key={item.tag}
                            >
                                <div className="flex gap-2 items-center">
                                    <div>
                                        {item.tag}
                                    </div>
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
                </section>

                <section 
                className="flex flex-row flex-wrap justify-center gap-4">
                    {
                        (!outfitsFiltered || outfitsFiltered.length == 0) &&
                        <div className="h-screen">No results at this time </div>
                    }
                    {outfitsFiltered &&
                        outfitsFiltered.map((item) => {
                            let userRating: Rating | null = null
                            if (userRatings) {
                                userRating = userRatings?.filter(r => r.outfit_id == item.id)[0]
                            }

                            return ( 
                                <OutfitCard
                                    cookie={cookie}
                                    data={item}
                                    key={item.id}
                                    userRating={userRating}
                                    clientServer={clientServer}
                                    verifiedBusiness={businesses && businesses.filter(id => item.username == id).length > 0 ? true : false}
                                />
                          
                            )
                        })}
                </section>
            </main>
            <Footer />
        </>
    );
}

export default DiscoverPage;
