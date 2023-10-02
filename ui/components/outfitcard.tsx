import { useState } from 'react';

import { Outfit } from '../apis/get_outfits';
import { Rating } from '../apis/get_ratings';
import { Modal } from './modals';

function average(arr: number[]) {
    let sum = 0;
    arr.forEach((item) => (sum += item));

    return sum / arr.length;
}

export function OutfitCard(props: {
    data: Outfit;
    ratings: Rating[] | null;
    username?: string;
}) {
    const [expandImage, setExpandImage] = useState<boolean>(false);
    const [submitRating, setSubmitRating] = useState<boolean>(false);

    const [userItemRating, setUserItemRating] = useState<number>(2.5);

    let avg: number | null = null;
    if (props.ratings) {
        let ratingsArr = props.ratings.map((item) => Number(item.rating));
        avg = average(ratingsArr);
    }

    return (
        <>
            <div  className="w-full shadow-md p-4 bg-off-white rounded-md my-4 max-h-card overflow-auto border-2 border-off-white break-words">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 object-contain content-start">
                    <div className="col-span-1 mx-auto">
                        <img
                            className="h-96  object-contain"
                            src={props.data.picture_url}
                        />
                        <div className="flex flex-row-reverse">
                            <button onClick={() => setExpandImage(true)}>
                                {" "}
                                [expand img]
                            </button>
                        </div>
                    </div>

                    <div className="col-span-3 bg-white p-4 rounded-md">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="col-span-1">
                                <h3 className="font-semibold">{props.data.title}</h3>
                                <p>
                                    <span className="font-bold">date:</span>{" "}
                                    {props.data.date}
                                </p>
                                <p>
                                    <span className="font-bold">by:</span>{" "}
                                    {props.data.user_id}
                                </p>
                                <p className="font-bold">tags:</p>
                                <div className="flex gap-2">
                                    {props.data.style_tags.map((item) => (
                                        <div className="" key={item}>{item}</div>
                                    ))}
                                </div>
                            </div>
                            <div className="col-span-2">
                                <div className="flex items-center">
                                    {!avg ? (
                                        <>
                                            <div  className="text-xl text-white bg-pink px-3 rounded">{"  "}?{"  "}</div>
                                            <div className="mx-2">no ratings submitted yet</div>
                                        </>
                                    ) : (
                                        <>
                                            <div  className="text-xl text-white bg-pink p-1 rounded">{avg}{avg.toString().length > 1 ? "" : ".0"}</div>
                                            <div className="mx-2">
                                                from {props.ratings && props.ratings.length} ratings
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="flex my-2">
                                    {!submitRating ? (
                                        <div className="flex items-center gap-4">
                                            <div className="text-xl text-white bg-pink px-3 rounded">?</div>
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
                                                <div className="text-white text-xl bg-pink p-1 rounded">{userItemRating}</div>
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
                            <h3 className="col-span-1 underline font-semibold">Items</h3>
                            <h5 className="col-span-2 underline font-semibold">Review</h5>

                            {props.data.items.map((item) => (
                                <>
                                    <div className="col-span-1" key={`col-1-${item.brand}`}>
                                        <div className="font-bold text-lg">{item.description} {" "} {item.link && (
                                            <span className="text-pink font-normal text-xs">
                                                <a href={item.link} target="_blank">

                                                    [LINK]
                                                </a>
                                            </span>
                                        )}</div>
                                        <p>
                                            <span className="font-bold">from: </span>
                                            {item.brand}
                                        </p>
                                        <p>
                                            <span className="font-bold">size: </span>
                                            {item.size ? item.size : "n/a"}
                                        </p>
                                        <p>
                                            <span className="font-bold">price: </span>
                                            {item.price ? item.price : "n/a"}
                                        </p>
                                    </div>

                                    <div className="col-span-2" key={`col-2-${item.brand}`}>
                                        <div className="flex items-start">
                                            <div className="text-white bg-pink p-1 rounded">{item.rating}{item.rating.toString().length > 2 ? "" : ".0"}</div>

                                            <div className="mx-2">&quot;{item.review}&quot;</div>
                                        </div>
                                    </div>

                                    <hr className="col-span-3 my-1" />
                                </>
                            ))}
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
