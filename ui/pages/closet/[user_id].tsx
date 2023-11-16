import { GetServerSideProps } from 'next';
import { useState, useEffect } from 'react';

import { GetPublicOutfitsByUser, Outfit, OutfitItem } from '../../apis/get_outfits';
import { GetRatings, Rating } from '../../apis/get_ratings';
import { Navbar } from '../../components/navarbar';
import { GetServerURL } from "../../apis/get_server";
import { ClosetTable } from '../../components/closet-table';
import { GetUsername } from '../../apis/get_user';
import { Footer } from '../../components/footer';

type Props = {
    cookie: string;
    error: string | null;
    outfits: Outfit[] | null;
    ratings: Rating[] | null;
    clientServer: string;
    closetName: string;
    username: string;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    let props: Props = {
        clientServer: "",
        cookie: "",
        error: null,
        outfits: null,
        ratings: null,
        closetName: "",
        username: "",
    };

    let server = GetServerURL()
    if (server instanceof Error) {
        props.error = server.message;
        return { props };
    }

    let cookie = context.req.cookies["rys-login"];
    props.cookie = cookie ? cookie : "";

    if (props.cookie) {
        const usernameResp = await GetUsername(server, props.cookie);
        if (!(usernameResp instanceof Error)) {
            props.username = usernameResp;
        }
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


function Rating(props: { x: number, small?: boolean }) {
    return (
        <div style={{ fontSize: props.small ? "18px" : "30px" }} className="text-primary">{props.x == 0 ? "?" : props.x}</div>
    )
}

export default function UserClosetPage({ clientServer, cookie, outfits, ratings, closetName, username, error }: Props) {
    if (error) {
        return (
            <>
                <Navbar clientServer={clientServer} cookie={cookie} user={username} />
                <main className="mt-6 p-3 md:p-8">
                    <h1>😕 Oh no</h1>
                    Looks like there&apos;s an error on our end. Please refresh the page in a
                    few minutes. If the issue persists, please email
                    sitesbystephanie@gmail.com.
                </main>
            </>
        );
    }

    if (!outfits || outfits.length == 0) {
        return (
            <>
                <Navbar clientServer={clientServer} cookie={cookie} user={username} />
                <main className="mt-6 p-3 md:p-8">
                    <section>
                        <h1>😕 Empty</h1>
                        Looks like the user hasn&apos;t posted any public outfits yet.
                    </section>
                </main>
            </>
        );
    }


    return (
        <>
            <Navbar clientServer={clientServer} cookie={cookie} user={username} />
            <main className="mt-6 p-3 md:p-8">
                <section className="my-4">
                    <h2 className="capitalize">{closetName}&apos;s Closet</h2>
                    <div>Select items from the closet below to see outfits that contain them.</div>
                    <ClosetTable outfits={outfits} cookie={cookie} clientServer={clientServer} ratings={ratings}/>
                </section>
            </main >
            <Footer />
        </>
    );
}

