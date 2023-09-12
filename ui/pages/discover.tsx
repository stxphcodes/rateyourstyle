import type { NextPage } from "next";
import { Navbar } from "../components/navarbar";
import { GetServerSideProps } from "next";
import Searchbar from "../components/searchbar";
import { useState } from "react";

type DiscoverItem = {
    tag: string;
    description: string;
    background_img: any;
    outfit_ids: string[];
}

type Props = {
    data: DiscoverItem[] | null;
    error: Error | null;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    let props: Props = {
        data: null,
        error: null,
    };

    let cookie = context.req.cookies['rys_user_id'];
    if (!cookie) {
        let resp = await fetch("http://localhost:8000/cookie").then(response => {
            console.log("this is repsonse")
            console.log(response)
            if (response.ok) {
                return null
            }

            return Error("cookie not set")
        })

        context.res.setHeader('set-cookie', ['rys_user_id=test'])

        if (resp === null) {
            console.log("good")
        }
    }

    let resp = await fetch("http://localhost:8000/discover")
        .then((response) => {
            if (!response.ok) {
                throw new Error("response not ok")
            }

            return response.json()
        })
        .then((data: DiscoverItem[]) => {
            return data
        }).catch((err) => {
            return err
        })

    props.data = resp
    return { props };
};


function Discover({
    data, error
}: Props) {
    const [searchTerms, setSearchTimes] = useState<string[] | null>(null);
    const [searchInput, setSearchInput] = useState<string>("");

    function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
        setSearchInput(event.target.value);
      }

    return (
        <main className="p-4">
            <Navbar />
            <h1>Discover</h1>
            <Searchbar
                inputValue={searchInput}
                handleInputChange={handleInputChange}
                handleSubmit={() => { }}
            />
            <div>
                <h2>Filters</h2>
            </div>
            <div className="grid grid-cols-4 gap-4 mt-4">
                {data?.map(item =>
                    <div
                        className={`w-full h-40 text-white p-4 rounded-lg`}
                        style={{ backgroundColor: `${item.background_img}` }}
                        key={item.tag}>
                        <h2>#{item.tag}</h2>
                        <p>{item.description}</p>
                    </div>
                )
                }
            </div>
        </main>

    )

}

export default Discover;