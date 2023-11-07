import { SortingArrowsIcon } from "./icons/sorting-arrows"
import { OutfitItem } from "../apis/get_outfits";

export function ClosetTable(props: { outfitItems: OutfitItem[], itemsSelected: string[] | null, handleItemSelection: any }) {
    return (
        <div className="overflow-x-auto shadow-md rounded-lg max-h-table">
            <table className="w-full text-xs md:text-sm text-left overflow-x-scroll">
                <thead className="text-xs uppercase bg-background">
                    <tr>
                        {props.handleItemSelection != null && 
                        <th scope="col" className="p-2">
                            <div className="flex items-center">

                            </div>
                        </th>
}
                        <th scope="col" className="p-2 py-4 ">
                            <div className="flex items-center">
                                Clothing Item
                                {/* <a href="#"><SortingArrowsIcon /></a> */}
                            </div>
                        </th>
                        <th scope="col" className="p-2 ">
                            <div className="flex items-center">
                                Brand
                                {/* <a href="#"><SortingArrowsIcon /></a> */}
                            </div>
                        </th>
                        <th scope="col" className="p-2 ">
                            <div className="flex items-center">
                                Size
                                {/* <a href="#"><SortingArrowsIcon /></a> */}
                            </div>
                        </th>
                        <th scope="col" className="p-2 ">
                            <div className="flex items-center">
                                Price
                                {/* <a href="#"><SortingArrowsIcon /></a> */}
                            </div>
                        </th>
                        <th scope="col" className="p-2 ">
                            <div className="flex items-center">
                                Rating
                                {/* <a href="#"><SortingArrowsIcon /></a> */}
                            </div>
                        </th>
                        <th scope="col" className="p-2 ">
                            <div className="flex items-center">
                                Review
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {props.outfitItems.map((item) => (
                        <tr className="bg-white border-b max-h-8 overflow-hidden" key={item.description}>
                            {props.handleItemSelection != null && 
                            <td className="p-2">
                                <input type="checkbox"
                                    onChange={() => props.handleItemSelection(item.description)}

                                    checked={props.itemsSelected ? props.itemsSelected.includes(item.description) : false}>
                                </input>
                            </td>
}
                            <td className="p-2 font-medium w-52">
                                {item.link ? <a href={item.link} target="_blank">{item.description}</a> : <span className="hover:cursor-not-allowed text-primary">{item.description}</span>}

                            </td>
                            <td className="p-2 ">
                                {item.brand}
                            </td>
                            <td className="p-2 ">
                                {item.size}
                            </td>
                            <td className="p-2 ">
                                {item.price}
                            </td>
                            <td className="p-2 ">
                                {item.rating}
                            </td>
                            <td className="p-2 ">
                                <div className="max-h-10 md:max-h-16 overflow-y-scroll">
                                    {item.review}
                                </div>
                            </td>
                        </tr>
                    ))
                    }
                </tbody>
            </table>
        </div>
    )
}