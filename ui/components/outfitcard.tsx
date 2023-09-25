import {useState} from 'react';

import {Outfit} from '../apis/get_outfits';
import {Modal} from './modals';

export function OutfitCard(props: {data: Outfit}) {
    const [expandImage, setExpandImage] = useState<boolean>(false);

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
                                        {/* <div className="px-2 py-1 border border-pink text-pink rounded-full text-lg">
                                        {props.data.audience_rating}
                                    </div> */}
                                        <h3 className="text-pink">4.2</h3>
                                        <div className="mx-2">from 20 ratings</div>
                                    </div>

                                    <div className="flex my-2">
                                        <h3 className="text-pink">?</h3>
                                        {/* <div className="px-4 py-1 border border-pink text-pink rounded-full text-lg">
                                        ?
                                    </div> */}
                                        <div className="mx-2">submit your rating</div>
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
                                                {/* <div className="px-2 py-1.5 border rounded-full text-pink border-pink"> */}
                                                <h3 className="text-pink ">{item.rating}</h3>
                                                {/* </div> */}

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
