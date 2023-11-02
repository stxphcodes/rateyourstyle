import { GetServerSideProps } from 'next';
import Link from "next/link";
import { useState, useEffect } from 'react';

import { GetOutfitsByUser, GetPublicOutfitsByUser, Outfit, OutfitItem } from '../../apis/get_outfits';
import { GetRatings, Rating } from '../../apis/get_ratings';
import { GetUserProfile, User, UserProfile } from '../../apis/get_user';
import { Navbar } from '../../components/navarbar';
import { OutfitCard } from '../../components/outfitcard';
import { GetServerURL } from "../../apis/get_server";
import { PostUserProfile } from '../../apis/post_user';
import { SortingArrowsIcon } from '../../components/icons/sorting-arrows';

type Props = {
    cookie: string;
    error: string | null;
    outfits: Outfit[] | null;
    ratings: Rating[] | null;
    clientServer: string;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    console.log("I an in line 23")
    let props: Props = {
        clientServer: "",
        cookie: "",
        error: null,
        outfits: null,
        ratings: null,
    };

    let server = GetServerURL()
    if (server instanceof Error) {
        props.error = server.message;
        return { props };
    }

    let cookie = context.req.cookies["rys-login"];
    props.cookie = cookie ? cookie : "";

    let username = context.query["user_id"];
    if (typeof username !== "string") {
        props.error = "missing username"
        return { props };
    }

    const resp = await GetPublicOutfitsByUser(server, props.cookie, username);
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
        <div style={{ fontSize: props.small ? "18px" : "30px" }} className="text-pink">{props.x == 0 ? "?" : props.x}</div>
    )
}

export default function UserClosePage({ clientServer, cookie, outfits, ratings, error }: Props) {
    if (error) {


        return (
            <>
                <Navbar clientServer={clientServer} cookie={cookie} />
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
                <Navbar clientServer={clientServer} cookie={cookie} />
                <main className="mt-6 p-3 md:p-8">
                    <section>
                        <h2>Your Profile</h2>

                    </section>


                </main>
            </>
        );
    }


    let outfitItemToIds: Map<string, string[]> = new Map<string, string[]>();
    let outfitItems: OutfitItem[] = [];

    outfits.map(outfit => {
        outfit.items.map(item => {
            if (!outfitItemToIds.has(item.description)) {
                outfitItems.push(item);
                outfitItemToIds.set(item.description, [outfit.id]);
            } else {
                let outfitIds = outfitItemToIds.get(item.description) || [];
                outfitIds.push(outfit.id)
                outfitItemToIds.set(item.description, outfitIds);
            }
        })
    })



    const [itemsSelected, setItemsSelected] = useState<string[] | null>(null);
    const [outfitsToDisplay, setOutfitsToDisplay] = useState<Outfit[] | null>(null);

    useEffect(() => {
        if (!itemsSelected) {
            setOutfitsToDisplay(null);
            return
        }

        let newOutfits: string[] = [];
        itemsSelected.map((item) => {
            let ids = outfitItemToIds.get(item)
            if (ids) {
                newOutfits.push(...ids)
            }
        })

        setOutfitsToDisplay(outfits.filter(outfit =>
            newOutfits.includes(outfit.id)));

    }, [itemsSelected])

    return (
        <>
            <Navbar clientServer={clientServer} cookie={cookie} />
            <main className="mt-6 p-3 md:p-8">



                <section className="my-4">
                    <h2>So and So 2023 Closet</h2>

                    <div className="overflow-x-auto shadow-md sm:rounded-lg">
                        <table className="w-full text-sm text-left overflow-x-scroll">
                            <thead className="text-xs uppercase bg-off-white">
                                <tr>
                                    <th scope="col" className="p-4">
                                        <div className="flex items-center">

                                        </div>
                                    </th>
                                    <th scope="col" className="p-4">
                                        <div className="flex items-center">
                                            Clothing Item
                                            <a href="#"><SortingArrowsIcon /></a>
                                        </div>
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        <div className="flex items-center">
                                            Brand
                                            <a href="#"><SortingArrowsIcon /></a>
                                        </div>
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        <div className="flex items-center">
                                            Size
                                            <a href="#"><SortingArrowsIcon /></a>
                                        </div>
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        <div className="flex items-center">
                                            Price
                                            <a href="#"><SortingArrowsIcon /></a>
                                        </div>
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        <div className="flex items-center">
                                            Rating
                                            <a href="#"><SortingArrowsIcon /></a>
                                        </div>
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                        <div className="flex items-center">
                                            Review

                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {outfitItems.map((item) => (
                                    <tr className="bg-white border-b max-h-8 overflow-hidden">
                                        <td className="p-4">
                                            <input type="checkbox"
                                                onChange={() => {
                                                    if (!itemsSelected) {
                                                        setItemsSelected([item.description])
                                                        return
                                                    }

                                                    let idx = itemsSelected.indexOf(item.description)

                                                    if (idx < 0) {
                                                        setItemsSelected([
                                                            ...itemsSelected,
                                                            item.description,
                                                        ])
                                                    } else {
                                                        let copy = [...itemsSelected]
                                                        copy.splice(idx, 1)

                                                        setItemsSelected(copy)
                                                    }

                                                }}
                                                checked={itemsSelected ? itemsSelected.includes(item.description) : false}>
                                            </input>
                                        </td>
                                        <td className="p-3 font-medium w-52">
                                            {item.link ? <a href={item.link} target="_blank">{item.description}</a> : <span className="hover:cursor-not-allowed text-pink">{item.description}</span>}

                                        </td>
                                        <td className="p-3">
                                            {item.brand}
                                        </td>
                                        <td className="p-3">
                                            {item.size}
                                        </td>
                                        <td className="p-3">
                                            {item.price}
                                        </td>
                                        <td className="p-3">
                                            {item.rating}
                                        </td>
                                        <td className="p-3">
                                            <div className="max-h-16 overflow-y-scroll">
                                                {item.review}
                                            </div>
                                        </td>

                                    </tr>


                                ))
                                }
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="mt-8">
                    <h2>Your Outfits</h2>
                    <div>Select item(s) from your closet to see all of your outfits that contain the item.</div>


                    <div className="mt-4 p-1 bg-pink w-fit rounded text-white">Results: {outfitsToDisplay ? outfitsToDisplay.length : "none"}</div>

                    {outfitsToDisplay &&
                        outfitsToDisplay.map((item) => (
                            <OutfitCard
                                clientServer={clientServer}
                                cookie={cookie}
                                asUser={true}
                                data={item}
                                key={item.id}
                                ratings={
                                    ratings ? ratings.filter((r) => r.outfit_id == item.id) : null
                                }
                            />
                        ))}
                </section>
            </main >
        </>
    );
}

