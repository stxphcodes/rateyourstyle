import { GetServerSideProps } from 'next';
import Link from "next/link";

import { GetOutfitsByUser, Outfit } from '../../apis/get_outfits';
import { GetRatings, Rating } from '../../apis/get_ratings';
import { GetUsername } from '../../apis/get_user';
import { Navbar } from '../../components/navarbar';
import { OutfitCardUser } from '../../components/outfitcard-user';
import { GetServerURL } from "../../apis/get_server";

type Props = {
    cookie: string;
    username: string;
    error: string | null;
    outfits: Outfit[] | null;
    ratings: Rating[] | null;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    const server = GetServerURL();

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
        const usernameResp = await GetUsername(server, cookie);
        if (!(usernameResp instanceof Error)) {
            props.username = usernameResp;
        }
    }

    if (context.query["user_id"] !== props.username) {
        props.error = "forbidden";
        return { props };
    }

    const resp = await GetOutfitsByUser(server, props.cookie);
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

    return { props };
};

export default function Index({ cookie, username, outfits, ratings, error }: Props) {
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
                <Navbar cookie={cookie} user={username} />
                <main className="mt-6 p-8">
                    <h1 className="text-gray-200">Your outfits go here.</h1>
                    <p>
                        Click{" "}
                        <Link href="/post-outfit">
                            <a className="underline text-pink" >here</a>
                        </Link>{" "}
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
                <section>
                    <h3>Your Profile</h3>
                    <div>Username: {username}</div>
                    <div>Email: szh2425@gmail.com</div>
                </section>
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
            </main >
        </>
    );
}


