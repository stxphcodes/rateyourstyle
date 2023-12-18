import { useEffect, useState } from 'react';

import { Outfit, OutfitItem } from '../apis/get_outfits';
import { GetRatings, GetRatingsByOutfit, Rating } from '../apis/get_ratings';
import { Modal } from './modals';
import { PostRating } from '../apis/post_rating';
import { VerifiedCheckIcon } from './icons/verified-check-icon';
import Image from 'next/image'
import Link from 'next/link';


function Rating(props: { x: number, small?: boolean }) {
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
	const [submitRating, setSubmitRating] = useState<boolean>(false);
	const [userOutfitRating, setUserOutfitRating] = useState<number>(props.userRating?.rating ? props.userRating.rating : 0);

	const [userOutfitReview, setOutfitReview] = useState<string>(props.userRating?.review ? props.userRating.review : "")
	const [userReviewMissing, setUserReviewMissing] = useState<boolean>(false);

	const [allRatings, setAllRatings] = useState<Rating[] | null>(null)
	const [readMore, setReadMore] = useState(false)


	const handleSubmitRating = async (e: any) => {
		e.preventDefault();

		if (userOutfitReview == "") {
			setUserReviewMissing(true)
			return;
		}

		setUserReviewMissing(false)
		const resp = await PostRating(props.clientServer, props.cookie, props.data.id, userOutfitRating, userOutfitReview)
		if (resp instanceof Error) {
			return;
		}


		let ratingsResp = await GetRatingsByOutfit(props.clientServer, props.data.id)
		if (!(ratingsResp instanceof Error)) {
			setAllRatings(ratingsResp)
		}

		setSubmitRating(false);
	};

	useEffect(() => {
		async function fetchData() {
			let ratingsResp = await GetRatingsByOutfit(props.clientServer, props.data.id)
			if (!(ratingsResp instanceof Error)) {
				setAllRatings(ratingsResp)
			}
		}

		if (expandImage) {
			fetchData()
		}

	}, [expandImage])

	return (
		<>
			<div className="w-72 shadow-md break-words">
				<div className="px-2 py-1 bg-background text-sm " style={{ fontFamily: 'custom-serif' }}>
					{props.data.username ? <a className="flex flex-wrap items-center gap-1" href={`/closet/${props.data.username}`}>{props.data.username}&apos;s closet {props.verifiedBusiness && <VerifiedCheckIcon small={true} />}</a> : "anonymous"}


					<div className="">{props.data.date}</div>
				</div>
				<div className="relative   h-96 " onClick={() => setExpandImage(true)}>
					<Image

						alt={props.data.title}
						src={props.data.picture_url}
						layout="fill"
						objectFit="cover"
						sizes="(max-width: 768px) 60vw, 25vw"
					/>
				</div>
				<div className="p-2">
					<div style={{ fontFamily: 'custom-serif' }} className="whitespace-nowrap text-ellipsis overflow-hidden">{props.data.title}</div>
					<div className="flex items-center mt-1">
						<div className="hover:cursor-pointer mr-2" onClick={() => setExpandImage(true)}>
							<Rating x={props.data.rating_average ? props.data.rating_average : 0} small={true} />
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
				<Modal handleClose={() => setExpandImage(false)} fullHeight={true} wideScreen={true} noPadding={true}>
					<div className="md:flex md:gapx-2 md:align-start md:flex-row w-full">
						<div className="basis-1/2">
							<img className=" mb-2" src={props.data.picture_url}></img>
						</div>

						<div className="basis-1/2 w-full">
							<div className="px-4">
								<div>
									{props.data.username ? <a className="" href={`/closet/${props.data.username}`}>{props.data.username}&apos;s closet</a> : "anonymous"}<span className=" text-xs">{" | "} {props.data.date}</span>
								</div>
								<h3 className="">{props.data.title}</h3>
								<div className="flex gap-2">
									{props.data.style_tags.map((item) => (
										<div className="" key={item}>{item}</div>
									))}
								</div>

								<div className="">
									<a className="" onClick={(e) => {
										e.preventDefault()
										setReadMore(!readMore)
									}}>{!readMore ? `View ${props.data.items.length} ${props.data.items.length > 1 ? "items" : "item"}` : `Collapse items:`}

									</a>
								</div>

								{readMore &&
									<div className="pl-6">
										<OutfitItemList outfitItems={props.data.items} />
									</div>
								}

								<div className="flex items-center">
									<Rating x={props.data.rating_average ? props.data.rating_average : 0} />
									<div className="mx-2">
										{
											!props.data.rating_count ? "no reviews submitted yet" : `from ${props.data.rating_count} ${props.data.rating_count > 1 ? "reviews" : "review"} `
										}
									</div>
								</div>
								{!props.asUser && (
									<>
										{!submitRating ? (
											<>
												<div className="flex gap-4 items-center">
													<Rating x={userOutfitRating} />
													<a className="hover:cursor-pointer" onClick={() => setSubmitRating(true)}>{userOutfitRating == 0 ? "submit your review" : "edit your review"}</a>
												</div>
											</>
										) : (
											<>
												<div className="flex gap-4 items-center">
													<Rating x={userOutfitRating} />
													<div className="w-fit">
														<label>Your rating</label>
														<input
															id="rating"
															type="range"
															min="1"
															max="5"
															step="0.5"
															className="h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer  p-0 m-0"
															onChange={(e) =>
																setUserOutfitRating(Number(e.target.value))
															}
															list="rating"
															value={userOutfitRating}
														/>
														<datalist
															className="flex text-primary -mt-2 p-0 justify-between items-start"
															id="rating"
														>
															<option className="text-xs">|</option>
															<option className="text-xs">|</option>
															<option className="text-xs">|</option>
															<option className="text-xs">|</option>
															<option className="text-xs">|</option>
														</datalist>
													</div>
												</div>

												<div>
													<textarea rows={4} className="m-2 w-full md:w-1/2" placeholder="Leave a comment" onChange={(e) => setOutfitReview(e.target.value)}
														value={userOutfitReview}
													></textarea>
												</div>
												{userReviewMissing && <div className="text-primary">Please leave a comment.</div>}
												<button
													className="bg-primary text-white p-1 rounded hover:bg-black"
													onClick={handleSubmitRating}
												>
													submit
												</button>
											</>
										)
										}
									</>
								)}
							</div>

							<div className="border-t-2 border-background px-4">
								{allRatings?.map(rating => {
									return (
										<div className="my-3" key={`${rating.outfit_id}-${rating.user_id}`}>
											<div className="text-xs">
												{!rating.username ? <span className="text-primary">anonymous</span> : <Link href={`/closet/${rating.username}`} passHref={true}>
													<a className="">{rating.username}</a>
												</Link>} | {rating.date} </div>
											<div className=""><span className="text-primary text-base pr-2">{rating.rating}</span>&quot;{rating.review}&quot;</div>
										</div>
									)
								})}
							</div>
						</div>
					</div>
				</Modal>
			)}
		</>
	);
}


function OutfitItemList(props: { outfitItems: OutfitItem[] }) {
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
							<Rating x={item.rating} small={true} />

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
