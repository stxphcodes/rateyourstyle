import { useState } from "react";
import { PostSearch } from "../apis/post_search";
import { SearchIcon } from "./icons/search";

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
          Something went wrong :\ Our search server seems to be down. Sorry for
          the inconvience, we&apos;re working to resolve the issue.
        </div>
      )}

      <form className="flex mb-2" onSubmit={(e) => handleSubmit(e)}>
        <input
          className="w-full rounded-l-lg rounded-r-none border-y-2 border-l-2 border-r-0 border-black text-sm"
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
          className="py-2 px-4 border-y-2  border-r-2 border-black hover:bg-primary hover:text-white hover:border-primary rounded-r-lg"
        >
          <SearchIcon />
        </button>
      </form>
    </>
  );
}
