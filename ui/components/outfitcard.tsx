import { useEffect, useState } from 'react';

import { Outfit } from '../apis/get_outfits';
import { GetRatings, Rating } from '../apis/get_ratings';
import { Modal } from './modals';
import { PostRating } from '../apis/post_rating';
import { LinkIcon } from './icons/link-icon';

function average(arr: number[]) {
	let sum = 0;
	arr.forEach((item) => (sum += item));

	return sum / arr.length;
}

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
	ratings: Rating[] | null;
	userRating?: number;
	username?: string;
	clientServer: string;
	asUser?: boolean;
}) {
	const [expandImage, setExpandImage] = useState<boolean>(false);
	const [submitRating, setSubmitRating] = useState<boolean>(false);
	const [userItemRating, setUserItemRating] = useState<number>(props.userRating ? props.userRating : 0);

	const [allRatings, setAllRatings] = useState<Rating[] | null>(props.ratings)
	const [ratingAverage, setRatingAverage] = useState<number | null>(null)

	const [readMore, setReadMore] = useState(false)

	const handleSubmitRating = async (e: any) => {
		e.preventDefault();

		const resp = await PostRating(props.clientServer, props.cookie, props.data.id, userItemRating)
		if (resp instanceof Error) {
			return;
		}

		const ratingResp = await GetRatings(props.clientServer)
		if (!(ratingResp instanceof Error)) {
			setAllRatings(ratingResp.filter(r => r.outfit_id == props.data.id))
		}

		setSubmitRating(false);
	};

	useEffect(() => {
		if (allRatings) {
			let ratingsArr = allRatings.map((item) => Number(item.rating));
			setRatingAverage(average(ratingsArr))
		}

	}, [allRatings])

	return (
		<>
			<div className="w-72 shadow-md break-words">
				<div className="px-2 py-3 bg-background">
					{props.data.user_id ? <a className="" href={`/closet/${props.data.user_id}`}>{props.data.user_id}&apos;s closet</a> : "anonymous"}<span className=" text-xs">{" | "} {props.data.date}</span>
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
						{!ratingAverage ? (
							<>
								<Rating x={0} />
								<div className="mx-2">no ratings submitted yet</div>
							</>
						) : (
							<>
								<Rating x={ratingAverage} />
								<div className="mx-2">
									from {allRatings && allRatings.length} ratings
								</div>
							</>
						)}
					</div>
					{!props.asUser && (
						<div className="flex gap-4 items-center">
							{!submitRating ? (
								<>
									<Rating x={userItemRating} />
									<a className="hover:cursor-pointer" onClick={() => setSubmitRating(true)}>{userItemRating == 0 ? "submit your rating" : "edit your rating"}</a>
								</>
							) : (
								<>
									<Rating x={userItemRating} />
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
												setUserItemRating(Number(e.target.value))
											}
											list="rating"
											value={userItemRating}
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
									<button
										className="bg-primary text-white p-1 rounded hover:bg-black"
										onClick={handleSubmitRating}
									>
										submit
									</button>
								</>
							)
							}
						</div>
					)}
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
				{/* </div> */}



			</div>

			{expandImage && (
				<Modal handleClose={() => setExpandImage(false)} fullHeight={true}>
					<img src={props.data.picture_url}></img>
				</Modal>
			)}
		</>
	);
}
