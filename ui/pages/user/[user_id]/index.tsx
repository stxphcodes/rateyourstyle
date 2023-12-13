import { GetServerSideProps } from 'next';
import Link from "next/link";
import { useState, useEffect } from 'react';

import { GetOutfitsByUser, Outfit, GetBusinessOutfits, OutfitItem } from '../../../apis/get_outfits';
import { GetRatings, Rating } from '../../../apis/get_ratings';
import { GetUserProfile, User, UserProfile } from '../../../apis/get_user';
import { Navbar } from '../../../components/navarbar';
import { GetServerURL } from "../../../apis/get_server";
import { PostUserProfile } from '../../../apis/post_user';
import { ClosetTable } from '../../../components/closet-table';
import { Footer } from '../../../components/footer';
import { BusinessProfile, GetBusinessProfile } from '../../../apis/get_businessprofile';
import { BusinessAccount } from '../../../components/modals/businessaccount';


type Props = {
    cookie: string;
    user: User;
    error: string | null;
    outfits: Outfit[] | null;
    userRatings: Rating[] | null;
    clientServer: string;
    businessProfile: BusinessProfile | null;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    let props: Props = {
        clientServer: "",
        cookie: "",
        user: { username: "", email: "", user_profile: { age_range: "", department: "", weight_range: "", height_range: "" } },
        error: null,
        outfits: null,
        userRatings: null,
        businessProfile: null,
    };

    let server = GetServerURL()
    if (server instanceof Error) {
        props.error = server.message;
        return { props };
    }

    let cookie = context.req.cookies["rys-login"];
    props.cookie = cookie ? cookie : "";

    if (cookie) {
        const userResp = await GetUserProfile(server, cookie);
        if (userResp instanceof Error) {
            props.error = userResp.message;
            return { props };
        }
        props.user = userResp;

        const ratingResp = await GetRatings(server, props.cookie);
        if (ratingResp instanceof Error) {
            props.error = ratingResp.message;
            return { props };
        }
        props.userRatings = ratingResp;

        const businessProfileResp = await GetBusinessProfile(server, cookie);
        if (!(businessProfileResp instanceof Error)) {
            props.businessProfile = businessProfileResp
        }
    }

    if (context.query["user_id"] !== props.user.username) {
        props.error = "forbidden";
        return { props };
    }

    const resp = await GetOutfitsByUser(server, props.cookie);
    if (resp instanceof Error) {
        props.error = resp.message;
        return { props };
    }
    props.outfits = resp;


    if (props.businessProfile) {
        const businessOutfitsResp = await GetBusinessOutfits(server, props.cookie)
        if (businessOutfitsResp instanceof Error) {
            props.error = businessOutfitsResp.message;
            return { props };
        }

        if (businessOutfitsResp && businessOutfitsResp.length > 0) {
            props.outfits.push(...businessOutfitsResp)
        }
    }

    // sort outfits by date
    props.outfits.sort((a, b) => a.date < b.date ? 1 : -1);

    const clientServer = GetServerURL(true);
    if (clientServer instanceof Error) {
        props.error = clientServer.message;
        return { props };
    }
    props.clientServer = clientServer;

    return { props };
};


function Rating(props: { x: number, small?: boolean }) {
    return (
        <div style={{ fontSize: props.small ? "18px" : "30px" }} className="text-primary">{props.x == 0 ? "?" : props.x}</div>
    )
}

export default function Index({ clientServer, cookie, user, outfits, userRatings, businessProfile, error }: Props) {
    const [switchToBusinessAccount, setSwitchToBusinessAccount] = useState(false)
    if (error) {
        if (error == "forbidden") {
            return (
                <>
                    <Navbar clientServer={clientServer} cookie={cookie} user={user.username} />
                    <main className="mt-20 px-4 md:px-8">
                        <h1>✋ Forbidden </h1>
                        Please sign in as the user to view their posts.
                    </main>
                </>
            );
        }

        return (
            <>
                <Navbar clientServer={clientServer} cookie={cookie} user={user.username} />
                <main className="mt-20 px-4 md:px-8">
                    <h1>😕 Oh no</h1>
                    Looks like there&apos;s an error on our end. Please refresh the page in a
                    few minutes. If the issue persists, please email
                    sitesbystephanie@gmail.com.
                </main>
            </>
        );
    }


    return (
        <>
            <Navbar clientServer={clientServer} cookie={cookie} user={user.username} />
            <main className="mt-20 px-4 md:px-8">
                <section className="mb-4">
                    <div className="bg-red-700 p-2 rounded text-white">
                        RateYourStyle is still being developed and we currently don&apos;t support editing outfit posts. This feature is coming very soon, I promise! If you have an outfit post that you want to edit, please email sitesbystephanie@gmail.com. Thank you for your patience and understanding 💛.
                    </div>
                </section>
                <section>
                    {!businessProfile && <button className="p-1 rounded hover:border-2 hover:border-primary text-white bg-primary hover:bg-white hover:text-primary" onClick={
                        (e) => { e.preventDefault(); setSwitchToBusinessAccount(true) }}>Switch to Business Account</button>
                    }
                    <h1>Your {businessProfile && "Business"} Profile</h1>
                    <div>Your profile is only visible and accessible to you. Your public outfits are shared on the homepage and  with campaign sponsors, while private outfits are only accessible to you and the campaign sponsor if it uses a campaign #tag.</div>

                    {businessProfile ? <div className="mt-2">
                    <div>
                            <span className="font-bold mr-2">Username:</span>{user.username}
                        </div>
                        <div>
                            <span className="font-bold mr-2">Email:</span>{user.email}
                        </div>
                        <div>
                            <span className="font-bold mr-2">Business description:</span>{businessProfile.description}
                        </div>
                        <div>
                            <span className="font-bold mr-2">Business address:</span>{businessProfile.address}
                        </div>

                    </div> : <UserProfileForm clientServer={clientServer} cookie={cookie} user={user} />}


                </section>

                {!outfits || outfits.length == 0 ?
                    <>
                        <h1 className="text-gray-200">Your outfits go here.</h1>
                        <p>
                            Click{" "}
                            <Link href="/post-outfit">
                                <a className="underline text-primary" >here</a>
                            </Link>{" "}
                            to post your first outfit.
                        </p>
                    </> :
                    <>
                        <section className="my-4">
                            <h1>Your Closet</h1>
                            <div>
                                <span className="font-bold">Share your closet: </span> <a target="_blank" href={`/closet/${user.username}`}>https://rateyourstyle.com/closet/{user.username}</a>
                            </div>
                            <div className="text-xs mb-2">Only items from public outfits will be shared. Select items from your closet to see items that contain them.</div>
                            <ClosetTable outfits={outfits} cookie={cookie} clientServer={clientServer} userRatings={userRatings} includeEdit={true} />
                        </section>
                    </>
                }
            </main >
            {
                switchToBusinessAccount && <BusinessAccount clientServer={clientServer} cookie={cookie} handleClose={() => setSwitchToBusinessAccount(false)} />
            }
            <Footer />
        </>
    );
}


function UserProfileForm(props: { clientServer: string, cookie: string, user: User }) {
    const [editUserProfile, setEditUserProfile] = useState<boolean>(false)
    const [department, setDepartment] = useState(props.user?.user_profile?.department)
    const [ageRange, setAgeRange] = useState(props.user?.user_profile?.age_range)
    const [heightRange, setHeightRange] = useState(props.user?.user_profile?.height_range)
    const [weightRange, setWeightRange] = useState(props.user?.user_profile?.weight_range)
    const [submitError, setSubmitError] = useState<string | null>(null);

    const flex = "flex flex-initial justify-start self-center flex-wrap"
    const defaultLang = "prefer not to disclose"

    const genderChoices = ["women", "men", "unisex", ""]

    const ageRangeChoices = ["16-20", "21-25", "26-30", "31-35", "36-40", "41-50", "51-60", "60-70", ""]

    const weightRangeChoices = ["80-100", "101-115", "116-130", "131-145", "146-160", "161-175", "176-200", "201-225", "226-250", "250-300", ""]

    const heightRangeChoices = ["4'6-4'11", "5'-5'3", "5'4-5'7", "5'8-5'11", "6'-6'3", "6'4-6'7", "6'7-7'", ""]

    return (
        <div className="">
            <div className={`${flex} my-3`}>
                <div className="font-bold mr-2">Username</div>
                <div>{props.user.username}</div>
            </div>
            <div className={`${flex} my-3`}>
                <div className="font-bold mr-2">Email</div>
                <div>{props.user.email}</div>
            </div>

            <form className="">
                <div className="my-3">
                    <div className={`${flex}`}>
                        <div className="font-bold mr-2 ">
                            Department
                        </div>
                        {!editUserProfile ?
                            <div className="mr-2">{department ? department : defaultLang}</div>
                            :
                            <div className={flex}>
                                {
                                    genderChoices.map(item => (
                                        <div className={`${flex} mr-4`} key={item}>
                                            <input type="radio" className="mr-1" value={item} checked={department == item}
                                                onChange={() => setDepartment(item)}

                                            ></input>
                                            <label>{item == "" ? defaultLang : item}</label>
                                        </div>
                                    ))
                                }
                            </div>
                        }
                    </div>
                    {editUserProfile &&
                        <>
                            <div className="text-xs">Which department do most of your clothes come from?</div>
                            <div className="text-xs">We ask because most clothing stores are separated by departments as well.</div>
                        </>
                    }
                </div>

                <div className="my-3">
                    <div className={`${flex}`}>
                        <div className="font-bold mr-2 ">
                            Age Range
                        </div>
                        {!editUserProfile ?
                            <div className="mr-2">{ageRange ? ageRange : defaultLang}</div>
                            :
                            <div className={`${flex}`}>
                                {
                                    ageRangeChoices.map(item => (
                                        <div className={`${flex} mr-4`} key={item}>
                                            <input type="radio" className="mr-1" value={item} checked={ageRange == item}
                                                onChange={() => setAgeRange(item)}

                                            ></input>
                                            <label>{item == "" ? defaultLang : item}</label>
                                        </div>
                                    ))
                                }
                            </div>
                        }
                    </div>
                    {editUserProfile && <div className="text-xs">We ask because each generation has its own style, and it can help others of a similar age find style inspo!</div>}
                </div>


                <div className="my-2">
                    <div className={`${flex}`}>
                        <div className="font-bold mr-2 ">
                            Height Range (ft & in)
                        </div>
                        {!editUserProfile ?
                            <div className="mr-2">{heightRange ? heightRange : defaultLang}</div>
                            :
                            <div className={`${flex}`}>
                                {
                                    heightRangeChoices.map(item => (
                                        <div className={`${flex} mr-4 `} key={item}>
                                            <input type="radio" className="mr-1" value={item} checked={heightRange == item}
                                                onChange={() => setHeightRange(item)}

                                            ></input>
                                            <label>{item == "" ? defaultLang : item}</label>
                                        </div>
                                    ))
                                }
                            </div>
                        }
                    </div>
                    {editUserProfile && <div className="text-xs">We ask because this will help others of a similar height find clothing that will fit them.</div>}
                </div>


                <div className="my-2">
                    <div className={`${flex}`}>
                        <div className="font-bold mr-2 ">
                            Weight Range (lbs)
                        </div>
                        {!editUserProfile ?
                            <div className="mr-2">{weightRange ? weightRange : defaultLang}</div>
                            :
                            <div className={flex}>
                                {
                                    weightRangeChoices.map(item => (
                                        <div className={`${flex} mr-4`} key={item}>
                                            <input type="radio" className="mr-1" value={item} checked={weightRange == item}
                                                onChange={() => setWeightRange(item)}

                                            ></input>
                                            <label>{item == "" ? defaultLang : item}</label>
                                        </div>
                                    ))
                                }
                            </div>
                        }
                    </div>
                    {editUserProfile && <div className="text-xs">We ask because this can help others of a similar weight find clothing that will fit them.</div>}
                </div>

                {submitError && <div className="bg-red-500 p-1 my-2 text-white rounded">Oh no! We apologize, it looks like we are having server issues. Please refresh the page and try again.</div>}

                {!editUserProfile ?

                    <button
                        className="px-1 rounded border-2 border-primary text-primary hover:text-white hover:bg-primary"
                        onClick={(e) => {
                            e.preventDefault()
                            setEditUserProfile(true)
                        }} >edit</button>



                    :
                    <>

                        <button className="px-1 mr-2 bg-primary text-white h-fit rounded hover:text-black"
                            onClick={async (e) => {
                                e.preventDefault()
                                setEditUserProfile(false)

                                let data: UserProfile = {
                                    department: department ? department : "",
                                    age_range: ageRange ? ageRange : "",
                                    weight_range: weightRange ? weightRange : "",
                                    height_range: heightRange ? heightRange : "",
                                }

                                const resp = await PostUserProfile(props.clientServer, props.cookie, data)
                                if (resp instanceof Error) {
                                    setDepartment(props.user?.user_profile?.department)
                                    setAgeRange(props.user?.user_profile?.age_range)
                                    setHeightRange(props.user?.user_profile?.height_range)
                                    setWeightRange(props.user?.user_profile?.weight_range)
                                    setSubmitError(resp.message)
                                } else {
                                    location.reload()
                                }

                            }}>submit</button>

                        <button className="px-1 bg-black text-white h-fit rounded hover:text-primary"
                            onClick={(e) => {
                                e.preventDefault()
                                setDepartment(props.user?.user_profile?.department)
                                setAgeRange(props.user?.user_profile?.age_range)
                                setHeightRange(props.user?.user_profile?.height_range)
                                setWeightRange(props.user?.user_profile?.weight_range)
                                setEditUserProfile(false)
                            }}>cancel</button>
                    </>
                }
            </form>
        </div>
    )
}


