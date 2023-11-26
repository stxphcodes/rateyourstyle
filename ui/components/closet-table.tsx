import { SortingArrowsIcon } from "./icons/sorting-arrows"
import { OutfitItem, Outfit } from "../apis/get_outfits";
import { useEffect, useState } from "react";
import { Rating } from "../apis/get_ratings";
import { OutfitCard } from "./outfitcard";

export function ClosetTable(props: { outfits: Outfit[], cookie: string, clientServer: string, userRatings: Rating[] | null, onlyTable?: boolean }) {
    let outfitItemToIds: Map<string, string[]> = new Map<string, string[]>();
    let items: OutfitItem[] = []

    props.outfits.map(outfit => {
        outfit.items.map(item => {
            if (!outfitItemToIds.has(item.description)) {
                outfitItemToIds.set(item.description, [outfit.id]);
                 items.push(item);
            } else {
                let outfitIds = outfitItemToIds.get(item.description) || [];
                outfitItemToIds.set(item.description, outfitIds);
                outfitIds.push(outfit.id)

            }
        })
    })

    const [outfitItems, setOutfitItems] = useState<OutfitItem[]>(items )

    const [itemsSelected, setItemsSelected] = useState<string[] | null>(() => {
        let items = outfitItems.map(item => { return item.description })
        return items
    });

    const [outfitsToDisplay, setOutfitsToDisplay] = useState<Outfit[] | null>(props.outfits);

    const [sortBy, setSortBy] = useState<string>('name');

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

    const handleSelectAll = () => {
        if (itemsSelected == null || itemsSelected.length == 0) {
            setItemsSelected(outfitItems.map(item => item.description))
            return
        }


        if (itemsSelected.length != outfitItems.length) {
            setItemsSelected(outfitItems.map(item => item.description))
        } else {
            setItemsSelected(null);
        }
    }

    useEffect(() => {
        switch (sortBy) {
            case "name":

                setOutfitItems([...outfitItems.sort((a, b) => a.description.toLowerCase() < b.description.toLowerCase() ? -1 : 1)])
                break;
            case "name-reverse":
                setOutfitItems([...outfitItems.sort((a, b) => a.description.toLowerCase() > b.description.toLowerCase() ? -1 : 1)])
                break;
            case "brand":
                setOutfitItems([...outfitItems.sort((a, b) => a.brand.toLowerCase() < b.brand.toLowerCase() ? -1 : 1)])
                break;
            case "brand-reverse":
                setOutfitItems([...outfitItems.sort((a, b) => a.brand.toLowerCase() > b.brand.toLowerCase() ? -1 : 1)])
                break;
            case "size":
                setOutfitItems([...outfitItems.sort((a, b) => a.size.toLowerCase() < b.size.toLowerCase() ? -1 : 1)])
                break;
            case "size-reverse":
                setOutfitItems([...outfitItems.sort((a, b) => a.size.toLowerCase() > b.size.toLowerCase() ? -1 : 1)])
                break;

            case "price":
                setOutfitItems([...outfitItems.sort((a, b) => {
                    let aPrice = a.price.replace(/[^0-9]/g, "");
                    let bPrice = b.price.replace(/[^0-9]/g, "");

                    let aNum = 0
                    let bNum = 0
                    if (aPrice) {
                        aNum = Number(aPrice)
                    }
                    if (b) {
                        bNum = Number(bPrice)
                    }

                    if (Number(aNum) < Number(bNum)) {
                        return -1
                    } else {
                        return 1
                    }
                })]);
                break;
                case "price-reverse":
                    setOutfitItems([...outfitItems.sort((a, b) => {
                        let aPrice = a.price.replace(/[^0-9]/g, "");
                        let bPrice = b.price.replace(/[^0-9]/g, "");
    
                        let aNum = 0
                        let bNum = 0
                        if (aPrice) {
                            aNum = Number(aPrice)
                        }
                        if (b) {
                            bNum = Number(bPrice)
                        }
    
                        if (Number(aNum) > Number(bNum)) {
                            return -1
                        } else {
                            return 1
                        }
                    })]);
                    break;

            case "rating":
                setOutfitItems([...outfitItems.sort((a, b) => a.rating < b.rating ? -1 : 1)])
                break;
            case "rating-reverse":
                setOutfitItems([...outfitItems.sort((a, b) => a.rating > b.rating ? -1 : 1)])
                break;

        }

    }, [sortBy])

    useEffect(() => {
        if (!itemsSelected || itemsSelected.length == 0) {
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

        setOutfitsToDisplay(props.outfits.filter(outfit =>
            newOutfits.includes(outfit.id)));

    }, [itemsSelected])


    return (
        <>
            <div className="overflow-x-auto shadow-md rounded-lg max-h-table">
                <table className="w-full text-xs md:text-sm text-left overflow-x-scroll">
                    <thead className="text-xs uppercase bg-background sticky top-0">
                        <tr>

                            <th scope="col" className="p-2">
                                <div className="flex items-center gap-1 text-xs">
                                    <input type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={itemsSelected ? itemsSelected.length == outfitItems.length : false}>
                                    </input>
                                    all
                                </div>
                            </th>

                            <th scope="col" className="p-2 py-4 ">
                                <div className="flex items-center">
                                    Clothing Item
                                    <div className="hover:cursor-pointer" onClick={() => {
                                        sortBy == "name" ? setSortBy("name-reverse") : setSortBy("name")

                                    }}><SortingArrowsIcon /></div>
                                </div>
                            </th>
                            <th scope="col" className="p-2 ">
                                <div className="flex items-center">
                                    Brand
                                    <div className="hover:cursor-pointer" onClick={() => {
                                        sortBy == "brand" ? setSortBy("brand-reverse") : setSortBy("brand")
                                    }}><SortingArrowsIcon /></div>
                                </div>
                            </th>
                            <th scope="col" className="p-2 ">
                                <div className="flex items-center">
                                    Size
                                    <div className="hover:cursor-pointer" onClick={() => sortBy == "size" ? setSortBy("size-reverse") : setSortBy("size")}><SortingArrowsIcon /></div>
                                </div>
                            </th>
                            <th scope="col" className="p-2 ">
                                <div className="flex items-center">
                                    Price
                                    <div className="hover:cursor-pointer" onClick={() => sortBy == "price" ? setSortBy("price-reverse") : setSortBy("price")}><SortingArrowsIcon /></div>
                                </div>
                            </th>
                            <th scope="col" className="p-2 ">
                                <div className="flex items-center">
                                    Rating
                                    <div className="hover:cursor-pointer" onClick={() => sortBy == "rating" ? setSortBy("rating-reverse") : setSortBy("rating")}><SortingArrowsIcon /></div>
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
                        {outfitItems.map((item) => (
                            <tr className="bg-white border-b max-h-8 overflow-hidden" key={item.id}>
                                <td className="p-2 flex gap-1">
                                    <input type="checkbox"
                                        className={handleItemSelection == null ? "cursor-not-allowed" : ""}
                                        onChange={() => handleItemSelection(item.description)}

                                        checked={itemsSelected ? itemsSelected.includes(item.description) : false}>
                                    </input>
                                    <div className="text-xs">
                                    ({outfitItemToIds.get(item.description)?.length})
                                    </div>

                                </td>
                                <td className="p-2 font-medium w-52">
                                    {item.link ? <a href={item.link} target="_blank">{item.description}</a> : <span className="">{item.description}</span>}

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

            {!props.onlyTable &&
                <>
                    <div className="my-4 p-1 bg-primary w-fit rounded text-white">Results: {outfitsToDisplay ? outfitsToDisplay.length : "none"}</div>

                    <div className="flex flex-row flex-wrap gap-4 items-start">
                        {outfitsToDisplay &&
                            outfitsToDisplay.map((item) => (
                                <OutfitCard
                                    clientServer={props.clientServer}
                                    cookie={props.cookie}
                                    data={item}
                                    key={item.id}
                                    userRating={
                                        props.userRatings ? props.userRatings.filter((r) => r.outfit_id == item.id)[0] : null
                                    }
                                />
                            ))}
                    </div>
                </>
            }
        </>
    )
}