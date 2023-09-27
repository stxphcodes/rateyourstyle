import type { NextPage } from "next";
import { GetServerSideProps } from 'next';
import { useState } from 'react';

import { Outfit, GetOutfitsByUser } from '../../apis/get_outfits';
import { GetUsername } from '../../apis/get_user';
import { Footer } from '../../components/footer';
import { Navbar } from '../../components/navarbar';
import { OutfitCard } from '../../components/outfitcard';

type Props = {
    cookie: string;
    username: string;
    error: string | null;
    outfits: Outfit[] | null;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    let props: Props = {
        cookie: "",
        username: "",
        error: null,
        outfits: null,
    };

    let cookie = context.req.cookies["rys-login"];
    props.cookie = cookie ? cookie : "";


    if (cookie) {
        const usernameResp = await GetUsername(cookie);
        if (!(usernameResp instanceof Error)) {
            props.username = usernameResp;
        }
    }

    if (context.query["user_id"] !== props.username) {
        props.error = "forbidden"
    }

    const resp = await GetOutfitsByUser(props.cookie);
    if (resp instanceof Error) {
        props.error = resp.message;
        return { props };
    }

    props.outfits = resp;





    return { props };
};

export default function Index({ cookie, username, outfits, error }: Props) {
    if (error) {
        if (error == "forbidden") {
            return (
                <>
                    <Navbar cookie={cookie} username={username} />

                    <main className="mt-6 p-8">
                        <h1>Forbidden</h1>
                    </main>

                </>
            )
        }

        return (
            <>
                <Navbar cookie={cookie} username={username} />

                <main className="mt-6 p-8">
                    <h1>Error</h1>
                </main>

            </>

        )
    }
    return <>
        <Navbar cookie={cookie} username={username} />

        <main className="mt-6 p-8">
            <section >
                {outfits &&
                    outfits.map((item) => <OutfitCard data={item} key={item.id} />)}
            </section>
        </main>
    </>
}