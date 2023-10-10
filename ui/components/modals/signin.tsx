import { useState } from 'react';

import { PostSignIn } from '../../apis/post_signin';
import { Modal } from './';
import { GetServerURL } from '../../apis/get_server';

export function SignIn(props: {handleClose: any}) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const server = GetServerURL(true);

    function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
        if (event.target.id == "username") {
            setUsername(event.target.value);
        }

        if (event.target.id == "password") {
            setPassword(event.target.value);
        }
    }

    async function handleSubmit(event: React.FormEvent<HTMLButtonElement>) {
        event.preventDefault();

        const resp = await PostSignIn(server, username, password);
        if (resp instanceof Error) {
            setError(resp.message);
            return;
        }

        document.cookie = resp;
        location.reload();
        return;
    }

    return (
        <Modal handleClose={props.handleClose}>
            <>
                <h2 className="mb-4">Sign In</h2>
                {error && (
                    <div className="p-2 my-2 bg-red-500 text-white">
                        Incorrect username or password.
                    </div>
                )}
                <form className="">
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
                        ></input>
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
                        ></input>
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            className="bg-pink hover:bg-black text-white font-bold py-2 px-4 rounded"
                            type="button"
                            onClick={handleSubmit}
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </>
        </Modal>
    );
}
