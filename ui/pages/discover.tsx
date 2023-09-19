import type {NextPage} from "next";
import {GetServerSideProps} from 'next';
import {useState} from 'react';

import {Navbar} from '../components/navarbar';
import Searchbar from '../components/searchbar';

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
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    let props: Props = {
        data: null,
        cookie: "",
        error: null,
    };

    let cookie = context.req.cookies["rys_user_id"];
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
        return {props};
    }

    return {props};
};

function Discover({data, cookie, error}: Props) {
    const [searchTerms, setSearchTerms] = useState<string[]>([]);
    const [searchInput, setSearchInput] = useState<string>("");



    function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
        setSearchInput(event.target.value);
    }

    return (
        <main className="p-4">
            <Navbar cookie={cookie} />
            <h1>Discover</h1>
            <Searchbar
                inputValue={searchInput}
                handleInputChange={handleInputChange}
                handleSubmit={() => { }}
            />
            <div>
                <h2>Filters</h2>
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
            <div className="text-lg">
                Click on a card below or enter something in the searchbar to see
                matching outfits.
            </div>
            <div className="grid grid-cols-4 gap-4 mt-4">
                {data?.map((item) => (
                    <div
                        className={`w-full h-40 text-white p-4 rounded-lg`}
                        style={{backgroundColor: `${item.background_img}`}}
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
        </main>
    );
}

export default Discover;
