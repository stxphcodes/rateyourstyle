export function PostOutfit(props: { handleClose: any }) {
    return (
        <>
            {/* <!-- Main modal --> */}
            <div id="staticModal" data-modal-backdrop="static" className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-3/4 z-50  bg-white p-12 shadow-lg  border-2 w-2/3">

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
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                                Username
                            </label>
                            <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="username" type="text" placeholder="Username"></input>
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                                Password
                            </label>
                            <input className="shadow appearance-none border border-red-500 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" id="password" type="password" placeholder="******************"></input>
                            <p className="text-red-500 text-xs italic">Please choose a password.</p>
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