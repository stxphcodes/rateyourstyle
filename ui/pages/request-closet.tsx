import { GetServerSideProps } from 'next';

import { GetUsername } from '../apis/get_user';
import { Footer } from '../components/footer';
import { Navbar } from '../components/navarbar';
import { GetServerURL } from '../apis/get_server';
import { PageMetadata } from './_app';
import { useState } from 'react';
import { PostClosetRequest } from '../apis/post_closetrequest';
import { ClosetRequest } from '../apis/post_closetrequest';

type Props = {
    cookie: string;
    error: string | null;
    //username: string;
    clientServer: string;
    metadata: PageMetadata;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    let props: Props = {
        cookie: "",
        error: null,
        //username: "",
        clientServer: "",
        metadata: {
            title: "RateYourStyle Business",
            description: "Collect user generated content for your business on RateYourStyle."
        }
    };

    let server = GetServerURL()
    if (server instanceof Error) {
        props.error = server.message;
        return { props };
    }

    let cookie = context.req.cookies["rys-login"];
    props.cookie = cookie ? cookie : "";

    // if (props.cookie) {
    //     const usernameResp = await GetUsername(server, props.cookie);
    //     if (!(usernameResp instanceof Error)) {
    //         props.username = usernameResp;
    //     }
    // }

    let clientServer = GetServerURL(true)
    if (clientServer instanceof Error) {
        props.error = clientServer.message;
        return { props };
    }

    props.clientServer = clientServer

    return { props };
};


export default function RequestClosetPage({ cookie, clientServer }: Props) {
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [reason, setReason] = useState("")
    const [link, setLink] = useState("")
    const [userEmail, setUserEmail] = useState("")
    const [owner, setOwner] = useState(false);
    const [validationErr, setValidationErr] = useState<string | null>(null)
    const [submissionStatus, setSubmissionStatus] = useState("")

    const handleInputChange = (e: any) => {
        setValidationErr(null)
        if (e.target.id == "name") {
            setName(e.target.value)
        }

        if (e.target.id == "description") {
            setDescription(e.target.value)
        }

        if (e.target.id == "reason") {
            setReason(e.target.value)
        }

        if (e.target.id == "link") {
            setLink(e.target.value)
        }

        if (e.target.id == "email") {
            setUserEmail(e.target.value)
        }
    }

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        if (!name || !link || !userEmail) {
            setValidationErr("Missing at least 1 required field.")
            return
        }

        let request: ClosetRequest = {
            name: name,
            description: description,
            reason: reason,
            link: link,
            user_email: userEmail,
            owner: owner,
        }

        const resp = await PostClosetRequest(clientServer, cookie, request)
        if (resp instanceof Error) {
            setSubmissionStatus(resp.message)
        } else {
            setSubmissionStatus("success")
        }
    }

    return (
        <>
            <Navbar clientServer={clientServer} cookie={cookie} />

            <main className="mt-12 sm:mt-20 px-4 md:px-8 w-full md:w-3/4">
                <section className="mb-4">
                    <h1>Request A Closet</h1>
                    <h5 className="my-2">Who, or what business do you want to see on RateYourStyle?</h5> <div>Whether it&apos;s an apparel brand, a celebrity, a local boutiqe, an influencer, a clothing designer, a fashion blogger, or anything in between, we will try to partner with them and curate their closet based on public outfits they&apos;ve posted.</div>

                    <form className="grid grid-cols-4 w-full gap-x-2 gap-y-4 p-4 border-2 rounded mt-4">
                        {
                            submissionStatus == "success" ? <div className="col-span-4">Thanks for submitting a closet request! Please allow for 1-2 business days for us to fulfill it, and we&apos;ll let you know as soon as the closet is up. </div> : submissionStatus && <div className="col-span-4">Uh oh. Looks like there was an error on our end in receiving your request. We&apos;re s sorry! Please refresh the page and try again, or email sitesbystephanie@gmail.com.
                            </div>
                        }

                        {!submissionStatus &&
                            <>
                                <div className="col-span-1">
                                    <label>Name</label>
                                    <label className="text-xs text-primary">Required</label>
                                </div>
                                <input
                                    type="text"
                                    id="name"
                                    className=" col-span-3"
                                    placeholder="Name of business or person"
                                    required
                                    onChange={(e) => handleInputChange(e)}
                                    value={name}
                                />
                                <div className="col-span-1">
                                    <label>Brief Description</label>
                                    <label className="text-xs font-normal">(Optional)</label>
                                </div>
                                <textarea
                                    rows={3}
                                    id="description"
                                    className="col-span-3"
                                    placeholder="What kind of business is this, or who are they?"
                                    onChange={(e) => handleInputChange(e)}
                                    value={description}
                                />
                                <div className="col-span-1">
                                    <label>Reason</label>
                                    <label className="text-xs font-normal">(Optional)</label>
                                </div>
                                <textarea
                                    rows={3}
                                    id="reason"
                                    className="col-span-3"
                                    placeholder="Why do you want to see them on RYS?"
                                    onChange={(e) => handleInputChange(e)}
                                    value={reason}
                                />
                                <div className="col-span-1">
                                    <label>Link</label>
                                    <label className="text-xs text-primary">Required</label>
                                </div>
                                <textarea
                                    rows={2}
                                    id="link"
                                    className="col-span-3"
                                    placeholder="Link to their website or social media page."
                                    onChange={(e) => handleInputChange(e)}
                                    value={link}
                                />
                                <div className="col-span-1">
                                    <label>Your Email</label>
                                    <label className="text-xs text-primary">Required</label>
                                </div>
                                <textarea
                                    rows={2}
                                    id="email"
                                    className="col-span-3"
                                    placeholder="To contact you when they&apos;ve been added."
                                    required
                                    onChange={(e) => handleInputChange(e)}
                                    value={userEmail}
                                />
                                <div className="col-span-4 flex gap-2 items-center">
                                    <input
                                        type="checkbox"
                                        className="h-fit w-fit"
                                        checked={owner}
                                        onChange={() => setOwner(!owner)}
                                    />
                                    <label>This is my own brand, store and/or business, and I&apos;d like RateYourStyle to start curating my closet for me.</label>
                                </div>
                                {validationErr && <div className="col-span-4 w-fit p-2 bg-red-700 text-white">{validationErr}</div>}

                                <button className="bg-primary w-full col-span-4 text-white rounded p-2" onClick={(e) => handleSubmit(e)}>Submit</button>
                            </>
                        }
                    </form>




                </section>

            </main>
            <Footer />
        </>
    );
}


