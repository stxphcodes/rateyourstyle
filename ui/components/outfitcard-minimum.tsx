import { useEffect, useState } from 'react';

import { Outfit } from '../apis/get_outfits';
import { GetRatings, Rating } from '../apis/get_ratings';
import { Modal } from './modals';
import { PostRating } from '../apis/post_rating';

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

export function OutfitCardMinimum(props: {
	cookie: string;
	data: Outfit;
	ratings: Rating[] | null;
	userRating?: number;
	username?: string;
	clientServer: string;
}) {
	const [expandImage, setExpandImage] = useState<boolean>(false);
	const [submitRating, setSubmitRating] = useState<boolean>(false);
	const [userItemRating, setUserItemRating] = useState<number>(props.userRating ? props.userRating : 0);
	const [ratingSubmissionStatus, setRatingSubmissionStatus] = useState("")
	const [allRatings, setAllRatings] = useState<Rating[] | null>(props.ratings)
	const [ratingAverage, setRatingAverage] = useState<number | null>(null)

	const [readMore, setReadMore] = useState(false)

	const handleSubmitRating = async (e: any) => {
		e.preventDefault();

		const resp = await PostRating(props.clientServer, props.cookie, props.data.id, userItemRating)
		if (resp instanceof Error) {
			setRatingSubmissionStatus("errorOnSubmission");
			return;
		}

		setRatingSubmissionStatus("success");
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
			<div className="w-72 shadow-md my-4 break-words">
			<div className="px-2 py-3 bg-background">
					{props.data.user_id ? <a className="" href={`/closet/${props.data.user_id}`}>{props.data.user_id}&apos;s closet</a> : "anonymous"}<span className=" text-xs">{" | "} {props.data.date}</span>
				</div>

				<img
					onClick={() => setExpandImage(true)}
					className="object-contain hover:cursor-pointer"
					src={props.data.picture_url}
				/>
			
				<div className={`p-2 bg-white ${readMore ? "" : "overflow-y-hidden max-h-60"}`}>
					<div className="col-span-1">
						<h3 className="">{props.data.title}</h3>
						
						<div className="flex gap-2">
							{props.data.style_tags.map((item) => (
								<div className="" key={item}>{item}</div>
							))}
						</div>
					</div>
					<div className="col-span-2">
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
					</div>
					<hr className="col-span-3 my-2" />
					{props.data.items.map((item, index) => {
						let count = index + 1;
						return (
							<>
								<div className="col-span-1" key={`col-1-${item.brand}`}>
									<h4>
										{count}.{" "}
										{item.link ? <a href={item.link} target="_blank">{item.description}</a> : <span className="hover:cursor-not-allowed text-primary">{item.description}</span>}
									</h4>
									<PSpan p={item.brand} span="from" />
									<PSpan p={item.size ? item.size : "n/a"} span="size" />
									<PSpan p={item.price ? item.price : "n/a"} span="price" />
								</div>

								<div className="col-span-2" key={`col-2-${item.brand}`}>
									<div className="flex items-start">
										<Rating x={item.rating} small={true} />

										<div className="mx-2 break-words">&quot;{item.review}&quot;</div>
									</div>
								</div>
								<hr className="col-span-3 my-2" />
							</>
						)
					}
					)}
				</div>

				<a className="mt-2 mx-1" onClick={(e) => {
					e.preventDefault()
					setReadMore(!readMore)
				}}>read {readMore ? "less" : "more"}</a>

			</div>

			{expandImage && (
				<Modal handleClose={() => setExpandImage(false)} fullHeight={true}>
					<img src={props.data.picture_url}></img>
				</Modal>
			)}
		</>
	);
}
