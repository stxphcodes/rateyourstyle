import {useEffect, useState} from 'react';

import {OutfitItem} from '../../apis/get_outfits';
import {PostImage} from '../../apis/post_image';
import {Modal, XButton} from './';

export function PostOutfit(props: {cookie: string; handleClose: any}) {
    const [file, setFile] = useState<File | null>(null);
    const [imageURL, setImageURL] = useState<string | null>("some");
    const [fileError, setFileError] = useState<string | null>(null);

    const [outfitItems, setOutfitItems] = useState<OutfitItem[]>([
        {
            brand: "",
            description: "",
            size: "",
            price: "",
            review: "",
            rating: 2.5,
            link: "",
        },
    ]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleItemChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        index: number
    ) => {
        let item = outfitItems[index];

        if (e.target.id == "description") {
            item.description = e.target.value;
        }

        if (e.target.id == "rating") {
            item.rating = Number(e.target.value);
        }

        setOutfitItems([
            ...outfitItems.slice(0, index),
            item,
            ...outfitItems.slice(index + 1),
        ]);
    };

    const handleAddItem = (e) => {
        e.preventDefault();
        setOutfitItems([
            ...outfitItems,
            {
                brand: "",
                description: "",
                size: "",
                price: "",
                review: "",
                rating: 2.5,
                link: "",
            },
        ]);
    };

    const handleRemoveItem = (e: any, index: number) => {
        e.preventDefault();
        setOutfitItems([
            ...outfitItems.splice(0, index),
            ...outfitItems.splice(index + 1),
        ]);
    };

    const handleSubmit = (e: any) => {
        e.preventDefault();
        console.log("this is outfit item");
        console.log(outfitItems);
    };

    useEffect(() => {
        async function upload(formData: any) {
            const resp = await PostImage(formData, props.cookie);
            if (resp instanceof Error) {
                setFileError(resp.message);
                return;
            }

            setImageURL(resp);
        }

        if (file) {
            const formData = new FormData();
            formData.append("file", file);

            upload(formData);
        }
    }, [file]);

    if (fileError) {
        return (
            <Modal handleClose={props.handleClose}>
                <h1>{fileError}</h1>
            </Modal>
        );
    }

    return (
        <Modal
            handleClose={props.handleClose}
            fullHeight={imageURL ? true : false}
            wideScreen={true}
        >
            <>
                <h2 className="mb-8">Outfit Post</h2>
                <form className="">
                    {imageURL ? (
                        <>
                            <img src={imageURL} className="w-40" />

                            <button onClick={(e) => {
                                e.preventDefault()
                                setFile(null)
                                setImageURL("")
                            }}> remove</button>

                        </>
                    ) : (
                        <>
                            <label htmlFor="file" className="sr-only">
                                Choose an image
                            </label>
                            <input
                                id="file"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </>
                    )}

                    {imageURL && (
                        <>
                            <div className="mb-4">
                                <label className="" htmlFor="caption">
                                    Outfit Caption
                                </label>
                                <input
                                    className="w-full mb-4"
                                    id="caption"
                                    type="text"
                                    placeholder="Caption"
                                ></input>
                                <label>Select a tag from the options below or enter your own. Start tags with '#'</label>
                                <input className="w-full" id="tags" type="text" placeholder="Ex. #athleisure #loungewear"></input>
                                <div className="flex gap-2 mt-2">
                                    <button className="bg-pink text-white p-2 rounded">
                                        #nyfw
                                    </button>
                                    <button className="bg-pink text-white p-2 rounded">
                                        #nyfw
                                    </button>
                                    <button className="bg-pink text-white p-2 rounded">
                                        #nyfw
                                    </button>
                                    <button className="bg-pink text-white p-2 rounded">
                                        #nyfw
                                    </button>
                                </div>
                            </div>

                            <div className="mb-4">
                                <h5>Outfit Items</h5>
                                <ul>
                                    {outfitItems.map((item, index) => {
                                        let displayCount = index + 1;
                                        return (
                                            <li className="shadow-lg border-2 border-off-white my-2 rounded-lg p-4">
                                                <div className="flex items-start justify-between">
                                                    <h6 className="mx-2">Item #{displayCount}.</h6>
                                                    <XButton
                                                        onClick={(e: any) => handleRemoveItem(e, index)}
                                                    />
                                                </div>
                                                <OutfitItemForm
                                                    item={item}
                                                    index={index}
                                                    handleItemChange={handleItemChange}
                                                />
                                            </li>
                                        );
                                    })}
                                </ul>
                                <button
                                    onClick={handleAddItem}
                                    className="p-2 bg-pink text-white rounded float-right"
                                >
                                    add item
                                </button>
                            </div>

                            <button
                                className="bg-pink hover:bg-black text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full mt-8"
                                type="button"
                                onClick={handleSubmit}
                            >
                                Submit
                            </button>
                        </>
                    )}
                </form>
            </>
        </Modal>
    );
}

function OutfitItemForm(props: {
    item: OutfitItem;
    index: number;
    handleItemChange: any;
}) {
    return (
        <div className="grid grid-cols-2 gap-4">
            <div className="col-span-1">
                <label>Please describe the item in a few words.</label>
                <input
                    className="w-full"
                    id="description"
                    type="text"
                    placeholder="Description"
                    onChange={(e) => props.handleItemChange(e, props.index)}
                    value={props.item.description}
                ></input>
                <label htmlFor="Email" className="text-pink italic font-normal">
                    Required
                </label>

                <label className="mt-2">
                    What brand is the item or where is it from?
                </label>
                <input
                    className="w-full"
                    id="brand"
                    type="text"
                    placeholder="Brand"
                ></input>
                <label htmlFor="Email" className="text-pink italic font-normal">
                    Required
                </label>

                <label className="mt-2">Link to the item</label>
                <input
                    className="w-full mb-2"
                    id="caption"
                    type="text"
                    placeholder="Link"
                ></input>

                <div className="flex gap-4">
                    <div>
                        <label>Item Size</label>
                        <input
                            className="w-full"
                            id="caption"
                            type="text"
                            placeholder="Size"
                        ></input>
                    </div>

                    <div>
                        <label>Purchased Price</label>
                        <input
                            className="w-full"
                            id="caption"
                            type="text"
                            placeholder="Price"
                        ></input>
                    </div>
                </div>
            </div>

            <div className="col-span-1">
                <div className="flex gap-4 items-center">
                    <div className="w-fit">
                        <label>Your rating</label>
                        <input
                            id="rating"
                            type="range"
                            min="1"
                            max="5"
                            step="0.5"
                            className="h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer  p-0 m-0"
                            onChange={(e) => props.handleItemChange(e, props.index)}
                            list="rating"
                            value={props.item.rating}
                        />
                        <datalist
                            className="flex text-pink -mt-2 p-0 justify-between items-start"
                            id="rating"
                        >
                            <option className="text-xs">|</option>
                            <option className="text-xs">|</option>
                            <option className="text-xs">|</option>
                            <option className="text-xs">|</option>
                            <option className="text-xs">|</option>
                        </datalist>
                    </div>
                    <h1 className="text-pink">{props.item.rating}</h1>
                </div>

                <label className="mt-2">Your Review</label>
                <textarea className="w-full" id="brand" placeholder="Review"></textarea>
                <label htmlFor="Email" className="text-pink italic font-normal">
                    Required
                </label>
            </div>
        </div>
    );
}
