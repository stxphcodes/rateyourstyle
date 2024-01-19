import { SortingArrowsIcon } from "./icons/sorting-arrows"
import { OutfitItem, Outfit } from "../apis/get_outfits";
import { useEffect, useState } from "react";
import { Rating } from "../apis/get_ratings";
import { OutfitCard } from "./outfitcard";
import { PutOutfitItem } from "../apis/put_outfititem";
import { Modal } from "./modals";
import { Budget } from "./budget-donut";
import { ClosetCostChart } from "./data-viz/pie-donut";
import { ItemPricesChart } from "./data-viz/box-and-whisker";
import { ItemCostPerWear } from "./data-viz/pie";

export function ClosetTable(props: { outfits: Outfit[], cookie: string, clientServer: string, userRatings: Rating[] | null, onlyTable?: boolean, includeEdit?: boolean, businesses?: string[] }) {
    let outfitItemToIds: Map<string, string[]> = new Map<string, string[]>();
    let items: OutfitItem[] = []

    props.outfits.map(outfit => {
        outfit.items.map(item => {
            if (!outfitItemToIds.has(item.id)) {
                outfitItemToIds.set(item.id, [outfit.id]);
                items.push(item);
            } else {
                let outfitIds = outfitItemToIds.get(item.id) || [];
                outfitItemToIds.set(item.id, outfitIds);
                outfitIds.push(outfit.id)

            }
        })
    })

    const [outfitItems, setOutfitItems] = useState<OutfitItem[]>(items)

    const [itemsSelected, setItemsSelected] = useState<string[] | null>(() => {
        let items = outfitItems.map(item => { return item.id })
        return items
    });

    const [outfitsToDisplay, setOutfitsToDisplay] = useState<Outfit[] | null>(props.outfits);

    const [sortBy, setSortBy] = useState<string>('name');

    const [itemEdit, setItemEdit] = useState<OutfitItem | null>(null);

    const [itemEditError, setItemEditError] = useState<string | null>(null);


    const handleItemSelection = (itemId: string) => {
        if (!itemsSelected) {
            setItemsSelected([itemId])
            return
        }

        let idx = itemsSelected.indexOf(itemId)

        if (idx < 0) {
            setItemsSelected([
                ...itemsSelected,
                itemId,
            ])
        } else {
            let copy = [...itemsSelected]
            copy.splice(idx, 1)

            setItemsSelected(copy)
        }
    }

    const handleSelectAll = () => {
        if (itemsSelected == null || itemsSelected.length == 0) {
            setItemsSelected(outfitItems.map(item => item.id))
            return
        }

        if (itemsSelected.length != outfitItems.length) {
            setItemsSelected(outfitItems.map(item => item.id))
        } else {
            setItemsSelected(null);
        }
    }

    const handleItemEdit = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
        if (!itemEdit) {
            return
        }

        let newItem: OutfitItem = { ...itemEdit };
        if (e.target.id == "description") {
            newItem.description = e.target.value;
        }

        if (e.target.id == "review") {
            newItem.review = e.target.value;
        }

        if (e.target.id == "link") {
            newItem.link = e.target.value;
        }

        if (e.target.id == "price") {
            newItem.price = e.target.value;
        }

        if (e.target.id == "size") {
            newItem.size = e.target.value;
        }

        if (e.target.id == "brand") {
            newItem.brand = e.target.value;
        }

        if (e.target.id == "color") {
            newItem.color = e.target.value;
        }

        if (e.target.id == "store") {
            newItem.store = e.target.value;
        }

        setItemEdit(newItem)
    }

    const handleSubmitItemEdit = async (e: any) => {
        e.preventDefault();

        if (!itemEdit) {
            setItemEditError("Missing required fields in item: color, clothing item, brand, and review.")
            return;
        }


        if (!itemEdit.description || !itemEdit.brand || !itemEdit.review || !itemEdit.color) {
            setItemEditError("Missing required fields in item: color, clothing item, brand, and review.")
            return;
        }


        const resp = await PutOutfitItem(props.clientServer, props.cookie, itemEdit)
        if (resp instanceof Error) {
            setItemEditError("Server error. We apologize for the inconvenience, please try again at a later time or email sitesbystephanie@gmail.com if the issue persists.")
            return;
        } else {
            location.reload()
        }
    }

    useEffect(() => {
        switch (sortBy) {
            case "color":
                setOutfitItems([...outfitItems.sort((a, b) => a.color.toLowerCase() < b.color.toLowerCase() ? -1 : 1)])
                break;
            case "color-reverse":
                setOutfitItems([...outfitItems.sort((a, b) => a.color.toLowerCase() > b.color.toLowerCase() ? -1 : 1)])
                break;
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
            case "store":
                setOutfitItems([...outfitItems.sort((a, b) => a.store.toLowerCase() < b.store.toLowerCase() ? -1 : 1)])
                break;
            case "store-reverse":
                setOutfitItems([...outfitItems.sort((a, b) => a.store.toLowerCase() > b.store.toLowerCase() ? -1 : 1)])
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
                    // remove any currency symbols, only grab numbers
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
            {
                itemsSelected &&
                    itemsSelected.length == outfitItems.length ?
                    <div className="grid grid-cols-1 sm:grid-cols-2 items-center">
                        <ClosetCostChart items={items} />
                        <ItemPricesChart items={items} />
                    </div>

                    :
                    (itemsSelected && itemsSelected.length > 1) ?
                        <div className="grid grid-cols-1 sm:grid-cols-2 items-center">
                            <ClosetCostChart items={items.filter(item => {
                                let idx = itemsSelected.findIndex(i => i === item.id)
                                return idx >= 0
                            })} />
                            <ItemPricesChart items={items.filter(item => {
                                let idx = itemsSelected.findIndex(i => i === item.id)
                                return idx >= 0
                            })} />
                        </div> :
                        itemsSelected && itemsSelected.length > 0 &&
                        <ItemCostPerWear item={
                            items.filter(item => {
                                let idx = itemsSelected.findIndex(i => i === item.id)
                                return idx >= 0
                            })[0]
                        }
                            count={

                                outfitItemToIds.get(itemsSelected[0]) ? outfitItemToIds.get(itemsSelected[0])?.length : 1}
                        />
            }
            {
                <h6 className="mb-2">Select items from the closet below to update graphs and see outfits that contain them.
                </h6>
            }
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
                            {props.includeEdit &&
                                <th scope="col" className="p-2">
                                    <div className="flex items-center gap-1 text-xs">
                                        edit
                                    </div>
                                </th>
                            }
                            <th scope="col" className="p-2">
                                <div className="flex items-center">
                                    Color
                                    <div className="hover:cursor-pointer" onClick={() => {
                                        sortBy == "color" ? setSortBy("color-reverse") : setSortBy("color")

                                    }}><SortingArrowsIcon /></div>
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
                            {itemEdit &&
                                <th scope="col" className="p-2 py-4 ">
                                    Link
                                </th>
                            }

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
                                    Store
                                    <div className="hover:cursor-pointer" onClick={() => {
                                        sortBy == "store" ? setSortBy("store-reverse") : setSortBy("store")
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
                    <tbody className="capitalize">
                        {outfitItems.map((item) => (
                            <tr className="bg-white border-b max-h-8 overflow-hidden" key={item.id}>
                                <td className="p-2">
                                    <div className="flex gap-1">
                                        <input type="checkbox"
                                            className={handleItemSelection == null ? "cursor-not-allowed" : ""}
                                            onChange={() => handleItemSelection(item.id)}

                                            checked={itemsSelected ? itemsSelected.includes(item.id) : false}>
                                        </input>
                                        <div className="text-xs">
                                            ({outfitItemToIds.get(item.id)?.length})
                                        </div>
                                    </div>
                                </td>
                                {props.includeEdit &&
                                    <td className="p-2">
                                        {
                                            (itemEdit && itemEdit.id == item.id) ? <button className="primaryButton" onClick={(e) => handleSubmitItemEdit(e)}>submit</button> :
                                                itemEdit ? <></> :

                                                    <button className="inverseButton" onClick={(e) => {
                                                        e.preventDefault();
                                                        setItemEdit(item)
                                                    }}>edit</button>
                                        }
                                    </td>
                                }
                                <td className="p-2 font-medium">
                                    {itemEdit && itemEdit.id == item.id ? <input id="color" value={itemEdit.color} onChange={e => handleItemEdit(e)} />
                                        :
                                        <>{item.color}</>
                                    }
                                </td>
                                <td className="p-2 font-medium w-52">
                                    {itemEdit && itemEdit.id == item.id ?
                                        <input id="description" value={itemEdit.description} onChange={e => handleItemEdit(e)} />
                                        :
                                        <>
                                            {item.link ? <a href={item.link} target="_blank">{item.description}</a> : <span className="">{item.description}</span>}
                                        </>
                                    }
                                </td>
                                {
                                    itemEdit && itemEdit.id == item.id &&
                                    <td className="p-2 ">
                                        <input id="link" value={itemEdit.link} onChange={e => handleItemEdit(e)} />
                                    </td>
                                }

                                <td className="p-2 ">
                                    {itemEdit && itemEdit.id == item.id ? <input id="brand" value={itemEdit.brand} onChange={e => handleItemEdit(e)} /> :
                                        <> {item.brand}</>
                                    }
                                </td>
                                <td className="p-2 ">
                                    {itemEdit && itemEdit.id == item.id ? <input id="store" value={itemEdit.store} onChange={e => handleItemEdit(e)} /> :
                                        <> {item.store}</>
                                    }
                                </td>
                                <td className="p-2 ">
                                    {itemEdit && itemEdit.id == item.id ? <input id="size" value={itemEdit.size} onChange={e => handleItemEdit(e)} />
                                        :
                                        <> {item.size}</>
                                    }
                                </td>
                                <td className="p-2 ">
                                    {itemEdit && itemEdit.id == item.id ? <input id="price" value={itemEdit.price} onChange={e => handleItemEdit(e)} /> :
                                        <> {item.price}</>
                                    }
                                </td>
                                <td className="p-2 ">
                                    {item.rating}
                                </td>
                                <td className="p-2 w-52 normal-case">
                                    {itemEdit && itemEdit.id == item.id ? <textarea rows={6} id="review" value={itemEdit.review} onChange={e => handleItemEdit(e)} />
                                        :
                                        <div className="max-h-10 md:max-h-16 overflow-y-scroll">
                                            {item.review}
                                        </div>
                                    }


                                </td>
                            </tr>
                        ))
                        }
                    </tbody>
                </table>
                {itemEditError &&
                    <Modal handleClose={() => setItemEditError("")}>
                        <div>{itemEditError}</div>
                    </Modal>
                }
            </div>

            {!props.onlyTable &&
                <>
                    <div className="my-4 p-1 bg-primary w-fit rounded text-white">Results: {outfitsToDisplay ? outfitsToDisplay.length : "none"}</div>

                    <div className="flex flex-row flex-wrap gap-2 sm:gap-4 justify-center">
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
                                    verifiedBusiness={props.businesses && props.businesses.filter(id => item.username == id).length > 0 ? true : false}
                                />
                            ))}
                    </div>
                </>
            }
        </>
    )
}