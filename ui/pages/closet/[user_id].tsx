import { GetServerSideProps } from 'next';
import { useState, useEffect } from 'react';

import { GetPublicOutfitsByUser, Outfit, OutfitItem } from '../../apis/get_outfits';
import { GetRatings, Rating } from '../../apis/get_ratings';
import { Navbar } from '../../components/navarbar';
import { OutfitCard } from '../../components/outfitcard';
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
    let outfitItemToIds: Map<string, string[]> = new Map<string, string[]>();
    let outfitItems: OutfitItem[] = [];

    outfits && outfits.map(outfit => {
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
        if (!itemsSelected || !outfits) {
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

    }, [itemsSelected, outfitItemToIds, outfits])
 

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

    const handleItemSelection = (itemDescription: string) => {
        if (!itemsSelected) {
            setItemsSelected([itemDescription])
            return
        }

        let idx = itemsSelected.indexOf(itemDescription)

        if (idx < 0) {
            setItemsSelected([
                ...itemsSelected,
                itemDescription,
            ])
        } else {
            let copy = [...itemsSelected]
            copy.splice(idx, 1)

            setItemsSelected(copy)
        }
    }

    return (
        <>
            <Navbar clientServer={clientServer} cookie={cookie} user={username} />
            <main className="mt-6 p-3 md:p-8">
                <section className="my-4">
                    <h2 className="capitalize">{closetName}&apos;s Closet</h2>
                    <ClosetTable outfitItems={outfitItems} itemsSelected={itemsSelected} handleItemSelection={handleItemSelection} />
                </section>

                <section className="mt-8">
                    <h2 className="capitalize">{closetName}&apos;s Outfits</h2>
                    <div>Select item(s) from their closet to see all of the outfits that contain the item.</div>


                    <div className="mt-4 p-1 bg-primary w-fit rounded text-white">Results: {outfitsToDisplay ? outfitsToDisplay.length : "none"}</div>

                    {outfitsToDisplay &&
                        outfitsToDisplay.map((item) => (
                            <OutfitCard
                                clientServer={clientServer}
                                cookie={cookie}
                                data={item}
                                key={item.id}
                                ratings={
                                    ratings ? ratings.filter((r) => r.outfit_id == item.id) : null
                                }
                            />
                        ))}
                </section>
            </main >
            <Footer />
        </>
    );
}

