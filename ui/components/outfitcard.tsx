import {  useState } from 'react';

import { Outfit, OutfitItem } from '../apis/get_outfits';
import { GetRatings, GetRatingsByOutfit, Rating } from '../apis/get_ratings';

import { VerifiedCheckIcon } from './icons/verified-check-icon';
import Link from 'next/link';
import { OutfitModal } from './outfit-modal';


export function RatingDiv(props: { x: number, small?: boolean }) {
	return (
		<div style={{ fontSize: props.small ? "18px" : "30px" }} className="text-primary">{props.x == 0 ? "?" : props.x}</div>
	)
}

function PSpan(props: { span: string; p: string }) {
	return (
		<p><span className="font-bold">{props.span}:{" "}</span>{props.p}</p>
	)
}

export function OutfitCard(props: {
	cookie: string;
	data: Outfit;
	userRating: Rating | null;
	username?: string;
	clientServer: string;
	asUser?: boolean;
	verifiedBusiness: boolean;
}) {
	const [expandImage, setExpandImage] = useState<boolean>(false);

	const [readMore, setReadMore] = useState(false)
	return (
		<>
			<div className="w-72 shadow-md break-words">
				<div className="px-2 py-1 bg-background text-sm " style={{ fontFamily: 'custom-serif' }}>
					{props.data.username ? <Link href={`/closet/${props.data.username}`} passHref={true}>
						<a className="flex flex-wrap items-center gap-1">{props.data.username}&apos;s closet {props.verifiedBusiness && <VerifiedCheckIcon small={true} />}</a>
					</Link> : <div>anonymous</div>}
					<div className="">{props.data.date}</div>
				</div>
				<div className="overflow-hidden h-96 hover:cursor-pointer">
					<img
						onClick={() => setExpandImage(true)}
						className="object-cover w-full h-full"
						src={props.data.picture_url_resized}
					/>
				</div>
				<div className="p-2">
					<div style={{ fontFamily: 'custom-serif' }} className="whitespace-nowrap text-ellipsis overflow-hidden">{props.data.title}</div>
					<div className="flex items-center mt-1">
						<div className="hover:cursor-pointer mr-2" onClick={() => setExpandImage(true)}>
							<RatingDiv x={props.data.rating_average ? props.data.rating_average : 0} small={true} />
						</div>
						<a className="" onClick={() => setExpandImage(true)}>
							{
								!props.data.rating_count ? "no reviews submitted yet" : `from ${props.data.rating_count} ${props.data.rating_count > 1 ? "reviews" : "review"} `
							}
						</a>
					</div>
				</div>

				{!readMore ?
					<div className="flex bg-background p-1 justify-center">
						<a className="" onClick={(e) => {
							e.preventDefault()
							setReadMore(!readMore)
						}}>View {props.data.items.length} {props.data.items.length > 1 ? "items" : "item"}</a>
					</div> : <hr className="my-2" />
				}

				{readMore &&
					<>
						<OutfitItemList outfitItems={props.data.items} />
						<div className="flex bg-background p-1 justify-center">
							<a className="" onClick={(e) => {
								e.preventDefault()
								setReadMore(!readMore)
							}}>View less</a>
						</div>
					</>
				}

			</div>

			{expandImage && (

				<OutfitModal clientServer={props.clientServer} cookie={props.cookie} handleClose={() => setExpandImage(false)} data={props.data} asUser={false} userRating={props.userRating} />

			)}
		</>
	);
}


export function OutfitItemList(props: { outfitItems: OutfitItem[] }) {
	return (
		<>
			{props.outfitItems.map((item, index) => {
				let count = index + 1;
				return (
					<div className="px-2 py-1" key={`col-1-${item.brand}`}>
						<h6 className="capitalize">
							{count}.{" "}
							{item.link ? <a href={item.link} target="_blank" className="">{item.color}{" "}{item.description} </a> : <span className="hover:cursor-not-allowed">{item.color}{" "}{item.description}</span>}
						</h6>
						{item.brand && <PSpan p={item.brand} span="Brand" />}
						{item.store && <PSpan p={item.store} span="Store" />}
						<PSpan p={item.size ? item.size : "n/a"} span="Size" />
						<PSpan p={item.price ? item.price : "n/a"} span="Price" />

						<div className="flex items-start">
							<RatingDiv x={item.rating} small={true} />

							<div className="mx-2 break-words">&quot;{item.review}&quot;</div>
						</div>

						{count !== props.outfitItems.length && <hr className="my-1" />}
					</div>
				)
			}
			)
			}
		</>
	)
}
