import { Outfit } from "../pages/api/types";

export function OutfitCard(props: { data: Outfit }) {
    return (
        <div className="w-fit shadow-md p-4 bg-off-white rounded-md my-4 max-h-card overflow-auto">
            <div className="grid grid-cols-4 gap-4 object-contain">
                <div className="col-span-1">
                    <img className="object-contain" src={props.data.picture_urls[0]} />
                </div>

                <div className="col-span-3">
                    <div className="bg-white p-2 rounded-md">

                        <div className="grid grid-cols-3 mb-8">
                            <div className="col-span-1">
                                <h5>
                                    {props.data.title}
                                </h5>
                                <p>date: {props.data.date} <br />
                                    modeled by: {props.data.model}</p>
                             
                            </div>
                            <div className="col-span-2">
                                <div className="flex items-center">
                                    <div className="px-2 py-1 border border-pink text-pink rounded-full text-lg">
                                        {props.data.audience_rating}
                                    </div>
                                    <div className="mx-2">
                                        from {props.data.audience_rating_count} ratings
                                    </div>
                                </div>

                                <div className="flex my-2">
                                    <div className="px-4 py-1 border border-pink text-pink rounded-full text-lg">
                                        ?
                                    </div>
                                    <div className="mx-2">
                                        submit your rating
                                    </div>
                                </div>
                            </div>

                        </div>


                        <ul className="">
                            <div className="grid grid-cols-3">
                                <h5 className="col-span-1">Items</h5>
                                <h5 className="col-span-2">Review</h5>
                            </div>
                            {props.data.items.map((item) => (
                                <li className="mt-4 grid grid-cols-3">
                                    <div className="col-span-1">
                                        <h6>{item.description}</h6>
                                        <p> <span className="italic">from: {item.brand}</span>
                                            <br />
                                            size: {item.size} <br />
                                            price: {item.price}

                                        </p>
                                    </div>

                                    <div className="col-span-2">
                                        <div className="flex items-center">
                                            <div className="px-2 py-1.5 border rounded-full text-pink border-pink">
                                                {item.rating}
                                            </div>
                                            <div className="mx-2">
                                                <span className="">"</span>{item.review}"
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
    );
}