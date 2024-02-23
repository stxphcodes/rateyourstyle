import { useState } from "react";
import { PostSearch } from "../apis/post_search";

export default function Searchbar(props: {
  clientServer: string;
  cookie: string;
  updateSearchResults: any;
  updateSearchNoResults: any;
}) {
  const [searchText, setSearchText] = useState<string>("");
  const [searchError, setSearchError] = useState<boolean>(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const resp = await PostSearch(props.clientServer, props.cookie, searchText);
    if (resp instanceof Error) {
      setSearchError(true);
      props.updateSearchNoResults();
      return;
    }

    setSearchError(false);
    if (Array.isArray(resp)) {
      if (resp.length > 0) {
        props.updateSearchResults(resp);
      } else {
        props.updateSearchNoResults();
      }
    }
  };

  return (
    <>
      {searchError && (
        <div className="text-primary mb-2">
          Oh no, our search engine is down :\ We apologize for the inconvience,
          please try again at a later time.
        </div>
      )}

      <form className="flex mb-2" onSubmit={(e) => handleSubmit(e)}>
        <input
          className="w-full rounded-l-lg rounded-r-none border-y-2 border-l-2 border-r-0 border-black"
          id="caption"
          type="text"
          placeholder="Search for specific styles, fashion brands, clothing items..."
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            if (e.target.value == "") {
              props.updateSearchResults([]);
              setSearchError(false);
            }
          }}
        ></input>
        <button
          type="submit"
          // onClick={(e) => handleSubmit(e)}
          className="py-2 px-4 bg-black text-white border-y-2 border-r-2 border-black hover:bg-primary rounded-r-lg"
        >
          Submit
        </button>
      </form>
    </>
  );
}
