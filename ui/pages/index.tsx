import type { NextPage } from "next";
import { GetServerSideProps } from 'next';
import { useState } from 'react';

import { Navbar } from '../components/navarbar';
import Searchbar from '../components/searchbar';
import { Outfit, GetOutfits } from "../apis/get_outfits";
import { OutfitCard } from "../components/outfitcard";

type DiscoverItem = {
    tag: string;
    description: string;
    background_img: any;
    outfit_ids: string[];
    cookie: string | null;
};

type Props = {
    data: DiscoverItem[] | null;
    cookie: string;
    error: string | null;
    outfits: Outfit[] | null;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    let props: Props = {
        data: null,
        cookie: "",
        error: null,
        outfits: null,
    };

    let cookie = context.req.cookies["rys-login"];
    props.cookie = cookie ? cookie : ""

    await fetch("http://localhost:8000/discover")
        .then((response) => {
            if (!response.ok) {
                throw new Error("response not ok");
            }

            return response.json();
        })
        .then((data: DiscoverItem[]) => {
            props.data = data;
        })
        .catch((err: Error) => {
            props.error = err.message;
        });

    if (props.error) {
        return { props };
    }

    const resp = await GetOutfits()
    if (resp instanceof Error) {
        props.error = resp.message
        return { props }
    }

    props.outfits = resp

    return { props };
};

function Home({ data, cookie, outfits, error }: Props) {
    const [searchTerms, setSearchTerms] = useState<string[]>([]);
    const [searchInput, setSearchInput] = useState<string>("");

    function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
        setSearchInput(event.target.value);
    }

    return (
        <main className="p-4">
            <header>
                <Navbar cookie={cookie} />
            </header>

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
                            className={`w-full h-40 text-white p-4 rounded-lg`}
                            style={{ backgroundColor: `${item.background_img}` }}
                            key={item.tag}
                            onClick={() => {
                                setSearchTerms([...searchTerms, item.tag]);
                            }}
                        >
                            <h2>#{item.tag}</h2>
                            <p>{item.description}</p>
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
                                            setSearchTerms(searchTerms.filter((item) => item !== term));
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

                {outfits && outfits.map((item) => <OutfitCard data={item} key={item.id} />)}
            </section>
        </main>
    );
}

export default Home;
