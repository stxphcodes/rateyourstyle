import { useState } from 'react';

import { PostUser } from '../../apis/post_user';
import { Modal } from './';

export function CreateAccount(props: {cookie: string; handleClose: any}) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [error, setError] = useState<string | null>(null);

    function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
        if (event.target.id == "username") {
            setUsername(event.target.value);
        }

        if (event.target.id == "password") {
            setPassword(event.target.value);
        }

        if (event.target.id == "email") {
            setEmail(event.target.value);
        }
    }

    async function handleSubmit(event: React.FormEvent<HTMLButtonElement>) {
        event.preventDefault();

        const resp = await PostUser(props.cookie, username, email, password);
        if (resp instanceof Error) {
            setError(resp.message);
            return;
        }

        document.cookie = resp;
        location.reload();
        return;
    }

    if (error && !error.includes("taken")) {
        return (
            <Modal handleClose={props.handleClose}>
                <div>
                    <h3>Uh oh. Looks like we encountered a server issue on our end.</h3>
                    If the issue persists, pleae email sitesbystephanie @gmail.com
                </div>
            </Modal>
        );
    }

    return (
        <Modal handleClose={props.handleClose}>
            <>

                <h2 className="mb-8">Create an Account</h2>
                {error && error.includes("taken") && (
                    <div className="p-2 my-2 bg-red-500 text-white">
                        {error}. please choose another.
                    </div>
                )}
                <form className="">
                    <div className="mb-4">
                        <label htmlFor="Email">Email</label>
                        <input
                            className="w-full"
                            id="email"
                            type="text"
                            placeholder="Email"
                            onChange={handleInputChange}
                            value={email}
                        />
                        <label htmlFor="Email" className="text-pink italic font-normal">
                            Required
                        </label>
                    </div>
                    <div className="mb-4">
                        <label className="" htmlFor="username">
                            Username
                        </label>
                        <input
                            className="w-full"
                            id="username"
                            type="text"
                            placeholder="Username"
                            onChange={handleInputChange}
                            value={username}
                        />
                        <label htmlFor="Email" className="text-pink italic font-normal">
                            Required
                        </label>
                    </div>
                    <div className="mb-6">
                        <label className="" htmlFor="password">
                            Password
                        </label>
                        <input
                            className="w-full"
                            id="password"
                            type="password"
                            placeholder="******************"
                            onChange={handleInputChange}
                            value={password}
                        />
                        <label htmlFor="Email" className="text-pink italic font-normal">
                            Required
                        </label>
                    </div>

                    <div className="flex items-center justify-between">
                        <button
                            className="bg-pink hover:bg-black text-white font-bold py-2 px-4 rounded"
                            type="submit"
                            onClick={handleSubmit}
                        >
                            Create Account
                        </button>
                    </div>
                </form>
            </>
        </Modal>

        // <>
        //     {/* <!-- Main modal --> */}
        //     <div id="staticModal" data-modal-backdrop="static" className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-3/4 z-50 w-fit p-4 bg-white p-12 shadow-lg w-1/2 border-2">

        //         {/* <!-- Modal body --> */}
        //         <div>
        //             <button type="button" className="text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-4 float-right" onClick={props.handleClose}>
        //                 <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
        //                     <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
        //                 </svg>
        //                 <span className="sr-only">Close modal</span>
        //             </button>
        //             <h2 className="mb-8">Create an Account</h2>
        //             <form className="">
        //                 <div className="mb-4">
        //                     <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="Email">
        //                         Email
        //                     </label>
        //                     <input
        //                         className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        //                         id="email"
        //                         type="text"
        //                         placeholder="Email"
        //                         onChange={handleInputChange}
        //                         value={email}
        //                     />
        //                 </div>
        //                 <div className="mb-4">
        //                     <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
        //                         Username
        //                     </label>
        //                     <input
        //                         className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="username"
        //                         type="text"
        //                         placeholder="Username"
        //                         onChange={handleInputChange}
        //                         value={username}
        //                     />
        //                 </div>
        //                 <div className="mb-6">
        //                     <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
        //                         Password
        //                     </label>
        //                     <input
        //                         className="shadow appearance-none border border-red-500 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
        //                         id="password"
        //                         type="password"
        //                         placeholder="******************"
        //                         onChange={handleInputChange}
        //                         value={password}
        //                     />
        //                     <p className="text-red-500 text-xs italic">Please choose a password.</p>
        //                 </div>

        //                 <div className="flex items-center justify-between">
        //                     <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit"
        //                         onClick={handleSubmit}>
        //                         Create Account
        //                     </button>
        //                 </div>
        //             </form>
        //         </div>
        //     </div>
        // </>
    );
}
