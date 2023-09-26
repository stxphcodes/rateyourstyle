import {useState} from 'react';

import {Outfit} from '../apis/get_outfits';
import {Modal} from './modals';

export function OutfitCard(props: {data: Outfit}) {
    const [expandImage, setExpandImage] = useState<boolean>(false);
    const [submitRating, setSubmitRating] = useState<boolean>(false);

    const [userItemRating, setUserItemRating] = useState<number>(2.5);

    return (
        <>
            <div className="w-fit shadow-md p-4 bg-off-white rounded-md my-4 max-h-card overflow-auto border-2 border-off-white">
                <div className="grid grid-cols-4 gap-4 object-contain">
                    <div className="col-span-1">
                        <div className="relative">
                            <img className="object-contain" src={props.data.picture_url} />
                            <button
                                className="absolute top-0 right-0 p-2 bg-pink text-white"
                                onClick={() => setExpandImage(true)}
                            >
                                {" "}
                                expand
                            </button>
                        </div>
                    </div>

                    <div className="col-span-3">
                        <div className="bg-white p-4 rounded-md">
                            <div className="grid grid-cols-3 gap-4 mb-8">
                                <div className="col-span-1">
                                    <h3>{props.data.title}</h3>
                                    <p>date: {props.data.date}</p>
                                    <p>modeled by: {props.data.user_id}</p>
                                </div>
                                <div className="col-span-2">
                                    <div className="flex items-center">
                                        <h1 className="text-pink">4.2</h1>
                                        <div className="mx-2">from 20 ratings</div>
                                    </div>

                                    <div className="flex my-2">
                                        {!submitRating ? (
                                            <div className="flex items-center gap-4">
                                                <h1 className="text-pink">?</h1>
                                                <div
                                                    className="hover:cursor-pointer underline"
                                                    onClick={() => setSubmitRating(true)}
                                                >
                                                    submit your rating
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex gap-4 items-center">
                                                    <h1 className="text-pink">{userItemRating}</h1>
                                                    <div className="w-fit">
                                                        <label>Your rating</label>
                                                        <input
                                                            id="rating"
                                                            type="range"
                                                            min="1"
                                                            max="5"
                                                            step="0.5"
                                                            className="h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer  p-0 m-0"
                                                            onChange={(e) =>
                                                                setUserItemRating(Number(e.target.value))
                                                            }
                                                            list="rating"
                                                            value={userItemRating}
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
                                                    <button
                                                        className="bg-pink text-white p-1 rounded hover:bg-black"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setSubmitRating(false);
                                                        }}
                                                    >
                                                        submit
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <ul className="">
                                <div className="grid grid-cols-3">
                                    <h5 className="col-span-1">Items</h5>
                                    <h5 className="col-span-2">Review</h5>
                                </div>
                                {props.data.items.map((item) => (
                                    <li
                                        className="mt-4 grid grid-cols-3 gap-4"
                                        key={item.description}
                                    >
                                        <div className="col-span-1">
                                            <h6 className="underline">{item.description}</h6>
                                            <p>
                                                <span className="font-bold">from: </span>
                                                {item.brand}
                                            </p>
                                            <p>
                                                <span className="font-bold">size: </span>
                                                {item.size}
                                            </p>
                                            <p>
                                                <span className="font-bold">price: </span>
                                                {item.price}
                                            </p>
                                        </div>

                                        <div className="col-span-2">
                                            <div className="flex items-start">
                                                <h3 className="text-pink ">{item.rating}</h3>

                                                <div className="mx-2">
                                                    <span className="">"</span>
                                                    {item.review}"
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {expandImage && (
                <Modal handleClose={() => setExpandImage(false)} fullHeight={true}>
                    <img src={props.data.picture_url}></img>
                </Modal>
            )}
        </>
    );
}
