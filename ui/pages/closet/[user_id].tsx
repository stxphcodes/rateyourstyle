import { GetServerSideProps } from 'next';
import { useState, useEffect } from 'react';

import { GetPublicOutfitsByUser, Outfit, GetBusinessOutfits } from '../../apis/get_outfits';
import { GetRatings, Rating } from '../../apis/get_ratings';
import { Navbar } from '../../components/navarbar';
import { GetServerURL } from "../../apis/get_server";
import { ClosetTable } from '../../components/closet-table';
import { GetUsername } from '../../apis/get_user';
import { Footer } from '../../components/footer';
import { BusinessProfile, GetBusinessProfile } from '../../apis/get_businessprofile';
import { VerifiedCheckIcon } from '../../components/icons/verified-check-icon';
import { SubmitOutfit } from '../../components/modals/submitoutfit';
import { GetBusinesses } from '../../apis/get_businesses';
import { AccountPromptModal } from '../../components/modals/accountPrompt';

type Props = {
    cookie: string;
    error: string | null;
    outfits: Outfit[] | null;
    userRatings: Rating[] | null;
    clientServer: string;
    closetName: string;
    businessProfile: BusinessProfile | null;
    businesses: string[];
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    let props: Props = {
        clientServer: "",
        cookie: "",
        error: null,
        outfits: null,
        userRatings: null,
        closetName: "",
        businessProfile: null,
        businesses: [],
    };

    let server = GetServerURL()
    if (server instanceof Error) {
        props.error = server.message;
        return { props };
    }

    let cookie = context.req.cookies["rys-login"];
    props.cookie = cookie ? cookie : "";

    if (props.cookie) {
        const ratingResp = await GetRatings(server, props.cookie);
        if (ratingResp instanceof Error) {
            props.error = ratingResp.message;
            return { props };
        }
        props.userRatings = ratingResp;
    }

    let closetName = context.query["user_id"];
    if (typeof closetName !== "string") {
        props.error = "missing username for closet"
        return { props };
    }
    props.closetName = closetName;

    const resp = await GetPublicOutfitsByUser(server, props.cookie, closetName);
    if (resp instanceof Error) {
        props.error = resp.message;
        return { props };
    }
    props.outfits = resp;

    const businessResp = await GetBusinesses(server, props.cookie);
    if (businessResp instanceof Error) {
        props.error = businessResp.message;
        return { props };
    }
    props.businesses = businessResp;

    const businessProfileResp = await GetBusinessProfile(server, props.cookie, props.closetName);
    if (!(businessProfileResp instanceof Error)) {
        props.businessProfile = businessProfileResp
    }

    if (props.businessProfile) {
        const businessOutfitsResp = await GetBusinessOutfits(server, props.cookie, props.closetName)
        if (businessOutfitsResp instanceof Error) {
            props.error = businessOutfitsResp.message;
            return { props };
        }

        if (businessOutfitsResp && businessOutfitsResp.length > 0) {
            props.outfits.push(...businessOutfitsResp)
        }
    }


    // sort outfits by date
    props.outfits.sort((a, b) => a.date < b.date ? 1 : -1);

    const clientServer = GetServerURL(true);
    if (clientServer instanceof Error) {
        props.error = clientServer.message;
        return { props };
    }
    props.clientServer = clientServer;

    return { props };
};


function Rating(props: { x: number, small?: boolean }) {
    return (
        <div style={{ fontSize: props.small ? "18px" : "30px" }} className="text-primary">{props.x == 0 ? "?" : props.x}</div>
    )
}

export default function UserClosetPage({ clientServer, cookie, outfits, userRatings, closetName, businessProfile, businesses, error }: Props) {
    const [submitOutfitClicked, setSubmitOutfitClicked] = useState(false);

    if (error) {
        return (
            <>
                <Navbar clientServer={clientServer} cookie={cookie} />
                <main className="mt-12 sm:mt-20 p-3 md:p-8">
                    <h1>😕 Oh no</h1>
                    Looks like there&apos;s an error on our end. Please refresh the page in a
                    few minutes. If the issue persists, please email
                    sitesbystephanie@gmail.com.
                </main>
            </>
        );
    }

    return (
        <>
            <Navbar clientServer={clientServer} cookie={cookie} />
            {!cookie && <AccountPromptModal clientServer={clientServer} />}
            <main className="mt-12 sm:mt-20 px-4 md:px-8">
                <section className="mb-4">
                    <div className="flex flex-wrap gap-2 items-center mb-1">
                        <h1 className="capitalize">{closetName}&apos;s Closet</h1>
                        {businessProfile && <VerifiedCheckIcon />}
                        {businessProfile &&
                            <button className="border-2 rounded border-primary px-2 text-primary  hover:bg-primary hover:text-white" onClick={(e) => { e.preventDefault(); console.log("button clicked"); setSubmitOutfitClicked(true) }}><span className="text-lg bold" >&#43;</span> Submit An Outfit</button>}
                    </div>
                    {businessProfile && <div className="">{businessProfile.description}</div>}

                    {!outfits || outfits.length == 0 ?
                        <div className="h-screen">
                            <h3>😕 Empty</h3>
                            Looks like the user hasn&apos;t posted any public outfits yet.
                        </div> :
                        <>
                            <div className="mt-4">Select items from the closet below to see outfits that contain them.</div>
                            <ClosetTable outfits={outfits} cookie={cookie} clientServer={clientServer} userRatings={userRatings} businesses={businesses} />
                        </>
                    }
                </section>
            </main >
            {submitOutfitClicked &&
                <SubmitOutfit
                    clientServer={clientServer}
                    cookie={cookie}
                    handleClose={() => {
                        setSubmitOutfitClicked(false)
                        location.reload();
                    }}
                    closetName={closetName}
                />
            }
            <Footer />
        </>
    );
}

