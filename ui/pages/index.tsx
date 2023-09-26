import type {NextPage} from "next";
import {GetServerSideProps} from 'next';
import {useState} from 'react';

import {Campaign, GetCampaigns} from '../apis/get_campaigns';
import {GetOutfits, Outfit} from '../apis/get_outfits';
import {GetUsername} from '../apis/get_user';
import {Footer} from '../components/footer';
import {Navbar} from '../components/navarbar';
import {OutfitCard} from '../components/outfitcard';
import Searchbar from '../components/searchbar';

type DiscoverItem = {
    tag: string;
    description: string;
    background_img: any;
    outfit_ids: string[];
    cookie: string | null;
};

type Props = {
    data: Campaign[] | null;
    cookie: string;
    username: string;
    error: string | null;
    outfits: Outfit[] | null;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    let props: Props = {
        data: null,
        cookie: "",
        username: "",
        error: null,
        outfits: null,
    };

    let cookie = context.req.cookies["rys-login"];
    props.cookie = cookie ? cookie : "";

    const campaignResp = await GetCampaigns();
    if (campaignResp instanceof Error) {
        props.error = campaignResp.message;
        return {props};
    }

    props.data = campaignResp;

    const resp = await GetOutfits();
    if (resp instanceof Error) {
        props.error = resp.message;
        return {props};
    }

    props.outfits = resp;

    if (cookie) {
        const usernameResp = await GetUsername(cookie);
        if (!(usernameResp instanceof Error)) {
            props.username = usernameResp;
        }
    }

    return {props};
};

function Home({data, cookie, username, outfits, error}: Props) {
    const [searchTerms, setSearchTerms] = useState<string[]>([]);
    const [searchInput, setSearchInput] = useState<string>("");
    const [readMore, setReadMore] = useState(() => {
        let intialState =
            data &&
            data.map((item) => ({
                tag: item.tag,
                readMore: false,
            }));

        return intialState;
    });

    function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
        setSearchInput(event.target.value);
    }

    if (error) {
        return <div>error {error} </div>;
    }

    return (
        <>
            <Navbar cookie={cookie} username={username} />

            <main className="mt-6 p-8">
                <section className="my-4">
                    <h1>Welcome to Rate Your Style</h1>
                    <div className="">
                        Creating a fashion database ranging from everyday wear worn by
                        fashion enthusiasts, to outfits worn by celebrities/influencers, to
                        looks model-ed on the runway. Use the database to find inspo, read
                        reviews, and upload your own outfit reviews.
                    </div>
                </section>

                <section className="my-8">
                    <h1>Discover</h1>
                    <div className="mb-4">
                        Click on a card below or enter something in the searchbar to see
                        matching outfits.
                    </div>
                    <Searchbar
                        inputValue={searchInput}
                        handleInputChange={handleInputChange}
                        handleSubmit={() => { }}
                    />

                    <div className="grid grid-cols-4 gap-4 mt-4">
                        {data?.map((item) => (
                            <div
                                className={`w-full  text-white p-4 rounded-lg h-fit`}
                                style={{backgroundColor: `${item.background_img}`}}
                                key={item.tag}
                            >
                                <h2
                                    className="hover:cursor-pointer"
                                    onClick={() => {
                                        setSearchTerms([...searchTerms, item.tag]);
                                    }}
                                >
                                    {item.tag}
                                </h2>
                                <p className="mb-2">Ends: {item.date_ending}</p>
                                {readMore?.filter((i) => i.tag == item.tag)[0].readMore && (
                                    <p className="mb-4">{item.description}</p>
                                )}
                                <a
                                    className="hover:cursor-pointer"
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

                    {searchTerms.length > 0 && (
                        <div>
                            <h2>Applied:</h2>
                            <div className="flex gap-4">
                                {searchTerms.map((term) => (
                                    <div className="bg-pink p-2 rounded-lg text-white">
                                        <span className="inline-block">{term}</span>
                                        <button
                                            className="ml-2 rounded-sm bg-white text-pink shadow-lg font-sans px-2 font-bold"
                                            onClick={() => {
                                                setSearchTerms(
                                                    searchTerms.filter((item) => item !== term)
                                                );
                                            }}
                                        >
                                            X
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </section>

                <section>
                    {outfits &&
                        outfits.map((item) => <OutfitCard data={item} key={item.id} />)}
                </section>
            </main>
            <Footer />
        </>
    );
}

export default Home;
