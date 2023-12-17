import { useState } from 'react';

import { Modal } from '.';
import { PostBusinessProfile } from '../../apis/post_businessprofile';
import { BusinessProfile } from '../../apis/get_businessprofile';

export function BusinessAccount(props: {clientServer: string; cookie: string; handleClose: any}) {
    const [address, setAddress] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState<string | null>(null);

    function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
        if (event.target.id == "description") {
            setDescription(event.target.value);
        }

        if (event.target.id == "address") {
            setAddress(event.target.value);
        }
    }

    async function handleSubmit(event: React.FormEvent<HTMLButtonElement>) {
        event.preventDefault();

        let profile: BusinessProfile = {
            description: description,
            address: address,
            date_created: "",
        }

        const resp = await PostBusinessProfile(props.clientServer, props.cookie, profile)
          if (resp instanceof Error) {
            setError(resp.message);
            return;
        }

        location.reload();
        return;
    }

    if (error) {
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
                <h2 className="mb-8">Create a Business Account</h2>
                {error && error.includes("taken") && (
                    <div className="p-2 my-2 bg-red-500 text-white">
                        {error}. please choose another.
                    </div>
                )}
                <form className="">
                    <div className="mb-4">
                        <label htmlFor="description">Description</label>
                        <input
                            className="w-full"
                            id="description"
                            type="text"
                            placeholder="Description"
                            onChange={handleInputChange}
                            value={description}
                        />
                        <label  className="text-primary italic font-normal">
                            Required
                        </label>
                    </div>
                    <div className="mb-4">
                        <label className="" htmlFor="Address">
                            Address
                        </label>
                        <input
                            className="w-full"
                            id="address"
                            type="text"
                            placeholder="Address"
                            onChange={handleInputChange}
                            value={address}
                        />
                        <label  className="text-primary italic font-normal">
                            Required
                        </label>
                    </div>
                   

                    <div className="flex items-center justify-between">
                        <button
                            className="bg-primary hover:bg-black text-white font-bold py-2 px-4 rounded"
                            type="submit"
                            onClick={handleSubmit}
                        >
                            Create Account
                        </button>
                    </div>
                </form>
            </>
        </Modal>
    );
}
