type Props = {
  handleInputChange: any;
  handleSubmit: any;
  inputValue: string;
};

export default function Searchbar({
  handleInputChange,
  handleSubmit,
  inputValue,
}: Props) {
  return (
    <div className="p-2 bg-black rounded-lg">
      <form className="flex items-center">
        <label className="sr-only">Search</label>
        <div className="relative w-full">
          <input
            type="text"
            id="simple-search"
            className="pl-10 p-2 text-sm md:text-lg w-full"
            placeholder="Search"
            required
            onChange={handleInputChange}
            value={inputValue}
          />
        </div>
        <button
          type="submit"
          className="bg-pink font-medium hover:bg-white ml-2 py-2 px-2 md:px-4 text-xs md:text-md rounded-lg text-white hover:text-pink"
          onClick={handleSubmit}
        >
          Search
        </button>
      </form>
    </div>
  );
}