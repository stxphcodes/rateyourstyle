import { useState, useEffect } from "react";
import { PostImage } from "../../apis/post_image";
import { OutfitItem } from "../../apis/get_outfits";


export function PostOutfit(props: { cookie: string, handleClose: any }) {
    const [file, setFile] = useState<File | null>(null);
    const [imageURL, setImageURL] = useState<string | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);

    const [outfitItems, setOutfitItems] = useState<OutfitItem[]>([{
        brand: "",
        description: "",
        size: "",
        price: "",
        review: "",
        rating: "",
        link: "",
    },
    {
        brand: "",
        description: "",
        size: "",
        price: "",
        review: "",
        rating: "",
        link: "",
    }])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {

            setFile(e.target.files[0]);
        }
    };

    useEffect(() => {
        async function upload(formData: any) {
            const resp = await PostImage(formData, props.cookie)
            if (resp instanceof Error) {
                setFileError(resp.message)
                return
            }

            setImageURL(resp)
        }

        if (file) {
            const formData = new FormData();
            formData.append("file", file);

            upload(formData)
        }

    }, [file])

    if (fileError) {
        return (
            <div id="staticModal" data-modal-backdrop="static" className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-3/4 z-50  bg-white p-12 shadow-lg  border-2 w-2/3 overflow-y-auto">
                <div>
                    <button type="button" className="text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-4 float-right" onClick={props.handleClose}>
                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                        </svg>
                        <span className="sr-only">Close modal</span>
                    </button>
                </div>

                <h1>{fileError}</h1>
            </div>
        )
    }

    return (
        <>
            {/* <!-- Main modal --> */}
            <div id="staticModal" data-modal-backdrop="static" className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50  bg-white p-12 shadow-lg  border-2 w-2/3 overflow-scroll h-full">

                {/* <!-- Modal body --> */}
                <div>
                    <button type="button" className="text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-4 float-right" onClick={props.handleClose}>
                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                        </svg>
                        <span className="sr-only">Close modal</span>
                    </button>
                    <h2 className="mb-8">Outfit Post</h2>
                    <form className="">

                        {
                            imageURL ? <img src={imageURL} className="w-40" /> :
                                <>
                                    <label htmlFor="file" className="sr-only">
                                        Choose an image
                                    </label>
                                    <input id="file" type="file" accept="image/*" onChange={handleFileChange} />
                                </>
                        }




                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="caption">
                                Outfit Caption
                            </label>
                            <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="caption" type="text" placeholder="Caption"></input>
                        </div>

                        <div className="mb-4">
                            <h5>Outfit Items</h5>
                            <ul>
                                {
                                    outfitItems.map((item, index) => {
                                        index++
                                        return (
                                            <li className="bg-off-white  rounded-lg p-4 grid grid-cols-8 gap-2">
                                                <h3>{index}.</h3>


                                                <div className="col-span-3">
                                                    <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline my-2" id="caption" type="text" placeholder="Description"></input>

                                                    <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline my-4" id="brand" type="text" placeholder="Brand" ></input>

                                                    <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline my-4" id="caption" type="text" placeholder="Size"></input>

                                                    <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline my-4" id="caption" type="text" placeholder="Price"></input>

                                                    <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline my-4" id="caption" type="text" placeholder="Link"></input>

                                                </div>

                                                <div className="col-span-4">
                                                    <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline my-2" id="brand" type="text" placeholder="Rating" ></input>

                                                    <textarea className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline my-4" id="brand" placeholder="Review" ></textarea>



                                                </div>

                                            </li>
                                        )

                                    })
                                }
                            </ul>







                        </div>

                        <div className="flex items-center justify-between">
                            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
                                Sign In
                            </button>
                            <button className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800" >
                                Create an Account
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}