import { useEffect, useState } from 'react';

import { Modal } from './';
import { Outfit } from '../../apis/get_outfits';
import { GetOutfitsByUser } from '../../apis/get_outfits';
import Link from 'next/link';
import { OutfitItem } from '../../apis/get_outfits';
import { BusinessOutfitSelected, PostBusinessOutfits } from '../../apis/post_businessoutfits';



export function SubmitOutfit(props: { clientServer: string; cookie: string; handleClose: any, closetName: string }) {

    const [userOutfits, setUserOutfits] = useState<Outfit[] | null>(null);
    const [err, setErr] = useState<string | null>(null);
    const [submissionValidationErr, setSubmissionValidationErr] = useState<string | null>(null);
    const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);
    const [outfitsSelected, setOutfitsSelected] = useState<BusinessOutfitSelected[] | null>(null);

    const handleOutfitClick = (outfitId: string) => {
        setSubmissionValidationErr(null);
        if (!outfitsSelected || outfitsSelected.length == 0) {
            setOutfitsSelected([{
                outfit_id: outfitId,
                item_ids: [],
            }])
            return
        }
        let copy = [...outfitsSelected]
        let found = false
        outfitsSelected.map((selected, index) => {
            if (selected.outfit_id == outfitId) {
                copy.splice(index, 1)
                found = true
                return
            }
        })

        if (!found) {
            copy.push({
                outfit_id: outfitId,
                item_ids: []
            })
        }

        setOutfitsSelected([...copy])
    }

    const handleOutfitItemClick = (outfitId: string, itemId: string) => {
        setSubmissionValidationErr(null)
        if (!outfitsSelected) {
            return
        }

        let copy = [...outfitsSelected]
        outfitsSelected.map((selected, index) => {
            if (selected.outfit_id == outfitId) {
                let found = false
                selected.item_ids.map((selectedItemId, itemIndex) => {
                    if (itemId == selectedItemId) {
                        copy[index].item_ids.splice(itemIndex, 1)
                        found = true
                    }
                })

                if (!found) {
                    copy[index].item_ids.push(itemId)
                }

            }
        })

        setOutfitsSelected([...copy])
    }

    const handleSubmit = async (e: any) => {
        e.preventDefault()

        if (!outfitsSelected || outfitsSelected.length == 0) {
            setSubmissionValidationErr("Please select at least 1 outfit and 1 outfit item to submit to the closet.")
            return
        }

        let missing = false
        outfitsSelected.map(outfit => {
            if (outfit.item_ids.length == 0) {
                missing = true

            }
        })

        if (missing) {
            setSubmissionValidationErr("Please select at least 1 item in each outfit to submit to the closet.")
            return;
        }


        const resp = await PostBusinessOutfits(props.clientServer, props.cookie, outfitsSelected, props.closetName)
        if (resp instanceof Error) {
            setSubmissionStatus(resp.message)
            return
        }

        setSubmissionStatus("success")
    }

    useEffect(() => {
        async function getData() {
            const resp = await GetOutfitsByUser(props.clientServer, props.cookie)
            if (resp instanceof Error) {
                setErr(resp.message)
                return
            }

            setUserOutfits(resp)
        }

        getData();
    }, [])


    return (
        <Modal handleClose={props.handleClose} wideScreen={true} fullHeight={true}>
            <>
                <h1 className="mb-8 capitalize">Submit an Outfit to {props.closetName}&apos; Closet</h1>

                {err && <div className="bg-red-700 w-fit p-2 text-white mb-4">Error: {err}</div>}


                {submissionStatus == "success" ? <h2>Your outfits have been successfully submitted.</h2>
                    : submissionStatus &&
                    <>
                        <h2 className="text-primary">Error submitting your outfits</h2>
                        <div>Please try again by refreshing the page. If the issue persists, please email sitesbystephanie@gmail.com.</div>
                    </>
                }



                {!err && !submissionStatus && <>
                    {!userOutfits || userOutfits.length == 0 ?
                        <div>No outfits from your closet to choose from. <Link href="/post-outfit" passHref={true}>
                            Post an Outfit
                        </Link> to start populating your closet.</div> :

                        <div>
                            <div className="flex gap-4 flex-wrap">
                                {userOutfits.map((outfit) => {
                                    let selected = outfitsSelected && outfitsSelected.filter(e => e.outfit_id === outfit.id).length > 0

                                    let selectedItems: string[] | null = null
                                    if (selected) {
                                        selectedItems = outfitsSelected && outfitsSelected.filter(e => e.outfit_id === outfit.id)[0].item_ids
                                    }

                                    return (
                                        <div className={`w-48 shadow-md break-words  ${selected ? "border-4 border-primary" : "border-none"}`}  key={outfit.id}>
                                            <img
                                                onClick={() => { handleOutfitClick(outfit.id) }}
                                                className="object-contain hover:cursor-pointer"
                                                src={outfit.picture_url}
                                            />

                                            <div className="p-2">
                                                <h6 className="">{outfit.title}</h6>
                                                <div>{outfit.date}</div>
                                                {
                                                    selected &&
                                                    outfit.items.map((i, count) => {
                                                        count = count + 1;
                                                        return (
                                                            <div className="mb-4 flex gap-2 items-start"
                                                            key={i.id+count}
                                                            >

                                                                <input className="mt-2" type="checkbox"
                                                                    onChange={() => handleOutfitItemClick(outfit.id, i.id)}
                                                                    checked={
                                                                        selectedItems && selectedItems.filter(e => e === i.id).length > 0 ? true : false}
                                                                >
                                                                </input>
                                                                <OutfitItemDiv i={i} count={count} />
                                                            </div>
                                                        )
                                                    })
                                                }
                                            </div>
                                        </div >
                                    )
                                })}
                            </div>
                            {submissionValidationErr && <div className="bg-red-700 w-fit p-2 text-white mt-4">Required: {submissionValidationErr }</div>}

                            <button className="mt-4 bg-primary text-white p-2 rounded w-full" onClick={(e) => handleSubmit(e)}>Submit</button>
                        </div>
                    }

                </>
                }
            </>
        </Modal>
    );
}

function PSpan(props: { span: string; p: string }) {
    return (
        <p><span className="font-bold">{props.span}:{" "}</span>{props.p}</p>
    )
}

function OutfitItemDiv(props: { i: OutfitItem, count: number }) {
    return (
        <div>
            <h6 className="capitalize">
                {props.count}.{" "}
                {props.i.link ? <a href={props.i.link} target="_blank" className="">{props.i.color}{" "}{props.i.description} </a> : <span className="hover:cursor-not-allowed">{props.i.color}{" "}{props.i.description}</span>}
            </h6>
            {/* </div> */}
            {props.i.brand && <PSpan p={props.i.brand} span="Brand" />}
            {props.i.store && <PSpan p={props.i.store} span="Store" />}
        </div>
    )

}
