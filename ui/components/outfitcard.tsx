import { useEffect, useState } from 'react';

import { Outfit } from '../apis/get_outfits';
import { GetRatings, GetRatingsByOutfit, Rating } from '../apis/get_ratings';
import { Modal } from './modals';
import { PostRating } from '../apis/post_rating';


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
				<div className="px-2 py-3 bg-background">
					{props.data.username ? <a className="" href={`/closet/${props.data.username}`}>{props.data.username}&apos;s closet</a> : "anonymous"}<span className=" text-xs">{" | "} {props.data.date}</span>
				</div>

				<img
					onClick={() => setExpandImage(true)}
					className="object-contain hover:cursor-pointer"
					src={props.data.picture_url}
				/>

				<div className="p-2">
					<h3 className="">{props.data.title}</h3>
					<div className="flex gap-2">
						{props.data.style_tags.map((item) => (
							<div className="" key={item}>{item}</div>
						))}
					</div>

					<div className="flex items-center">
						{!props.data.rating_average ? (
							<>
								<Rating x={0} />
								<a className="mx-2" onClick={() => setExpandImage(true)}>no ratings submitted yet</a>
							</>
						) : (
							<>
								<Rating x={props.data.rating_average} />
								<a className="mx-2" onClick={() => setExpandImage(true)}>
									from {props.data.rating_count} ratings
								</a>
							</>
						)}
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
						{props.data.items.map((item, index) => {
							let count = index + 1;
							return (
								<div className="px-2 py-1" key={`col-1-${item.brand}`}>
									<h4 className="">
										{count}.{" "}
										{item.link ? <a href={item.link} target="_blank" className="">{item.description} </a> : <span className="hover:cursor-not-allowed">{item.description}</span>}
									</h4>
									<PSpan p={item.brand} span="from" />
									<PSpan p={item.size ? item.size : "n/a"} span="size" />
									<PSpan p={item.price ? item.price : "n/a"} span="price" />

									<div className="flex items-start">
										<Rating x={item.rating} small={true} />

										<div className="mx-2 break-words">&quot;{item.review}&quot;</div>
									</div>

									{count !== props.data.items.length && <hr className="my-1" />}
								</div>
							)
						}
						)
						}
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

								<div className="flex items-center">
									{!props.data.rating_average ? (
										<>
											<Rating x={0} />
											<div className="mx-2">no ratings submitted yet</div>
										</>
									) : (
										<>
											<Rating x={props.data.rating_average} />
											<div className="mx-2">
												from {props.data.rating_count} ratings
											</div>
										</>
									)}
								</div>
								{!props.asUser && (
									<>
										{!submitRating ? (
											<>
												<div className="flex gap-4 items-center">
													<Rating x={userOutfitRating} />
													<a className="hover:cursor-pointer" onClick={() => setSubmitRating(true)}>{userOutfitRating == 0 ? "submit your rating" : "edit your rating"}</a>
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
											<div className="text-xs"><a >{rating.username ? rating.username : "anonymous"}</a> | {rating.date} </div>
											<div className="text-base"><span className="text-primary">{rating.rating}</span> "{rating.review}"</div>
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
