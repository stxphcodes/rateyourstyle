import {useState} from 'react';

import {PostSignIn} from '../../apis/post_signin';
import {Modal} from './';

export function SignIn(props: {handleClose: any}) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

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

        const resp = await PostSignIn(username, password);
        if (resp instanceof Error) {
            setError(resp.message);
            return;
        }

        document.cookie = resp;
        location.reload();
        return;
    }

    if (error) {
        return (
            <div>
                <h1>Error</h1>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <Modal handleClose={props.handleClose}>
            <>
                <h2 className="mb-4">Sign In</h2>
                <form className="">
                    <div className="mb-4">
                        <label className="" htmlFor="username">
                            Username
                        </label>
                        <input
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
                            className=""
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
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </>
        </Modal>


    );
}
