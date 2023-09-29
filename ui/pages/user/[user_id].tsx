import type {NextPage} from "next";
import { GetServerSideProps } from 'next';

import { GetOutfitsByUser, Outfit } from '../../apis/get_outfits';
import { GetRatings, Rating } from '../../apis/get_ratings';
import { GetUsername } from '../../apis/get_user';
import { Navbar } from '../../components/navarbar';
import { OutfitCardUser } from '../../components/outfitcard-user';

type Props = {
    cookie: string;
    username: string;
    error: string | null;
    outfits: Outfit[] | null;
    ratings: Rating[] | null;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    let props: Props = {
        cookie: "",
        username: "",
        error: null,
        outfits: null,
        ratings: null,
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
        props.error = "forbidden";
    }

    const resp = await GetOutfitsByUser(props.cookie);
    if (resp instanceof Error) {
        props.error = resp.message;
        return {props};
    }
    props.outfits = resp;

    const ratingResp = await GetRatings();
    if (ratingResp instanceof Error) {
        props.error = ratingResp.message;
        return {props};
    }
    props.ratings = ratingResp;

    return {props};
};

export default function Index({cookie, username, outfits, ratings, error}: Props) {
    if (error) {
        if (error == "forbidden") {
            return (
                <>
                    <Navbar cookie={cookie} user={username} />
                    <main className="mt-6 p-8">
                        <h1>✋ Forbidden </h1>
                        Please sign in as the user to view their posts.
                    </main>
                </>
            );
        }

        return (
            <>
                <Navbar cookie={cookie} user={username} />
                <main className="mt-6 p-8">
                    <h1>😕 Oh no</h1>
                    Looks like there's an error on our end. Please refresh the page in a
                    few minutes. If the issue persists, please email
                    sitesbystephanie@gmail.com.
                </main>
            </>
        );
    }

    if (!outfits || outfits.length == 0) {
        return (
            <>
                <Navbar cookie={cookie} user={username} />
                <main className="mt-6 p-8">
                    <h1 className="text-gray-200">Your outfits go here.</h1>
                    <p>
                        Click{" "}
                        <a className="underline text-pink" href="/post-outfit">
                            here
                        </a>{" "}
                        to post your first outfit.
                    </p>
                </main>
            </>
        );
    }
    return (
        <>
            <Navbar cookie={cookie} user={username} />
            <main className="mt-6 p-8">
                {outfits &&
                    outfits.map((item) => (
                        <OutfitCardUser
                            data={item}
                            key={item.id}
                            ratings={
                                ratings ? ratings.filter((r) => r.outfit_id == item.id) : null
                            }
                        />
                    ))}
            </main>
        </>
    );
}
