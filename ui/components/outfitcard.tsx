import { useEffect, useState } from 'react';

import { Outfit } from '../apis/get_outfits';
import { GetRatings, Rating } from '../apis/get_ratings';
import { Modal } from './modals';
import { PostRating } from '../apis/post_rating';
import { GetServerURL } from '../apis/get_server';

function average(arr: number[]) {
	let sum = 0;
	arr.forEach((item) => (sum += item));

	return sum / arr.length;
}

function Rating(props: { x: number, small?: boolean }) {
	return (
		<div style={{ fontSize: props.small ? "18px" : "30px" }} className="text-pink">{props.x == 0 ? "?" : props.x}</div>
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
	asUser?: boolean;
}) {
	const server = GetServerURL(true)

	const [expandImage, setExpandImage] = useState<boolean>(false);
	const [submitRating, setSubmitRating] = useState<boolean>(false);
	const [userItemRating, setUserItemRating] = useState<number>(props.userRating ? props.userRating : 0);
	const [ratingSubmissionStatus, setRatingSubmissionStatus] = useState("")
	const [allRatings, setAllRatings] = useState<Rating[] | null>(props.ratings)
	const [ratingAverage, setRatingAverage] = useState<number | null>(null)

	const handleSubmitRating = async (e: any) => {
		e.preventDefault();

		const resp = await PostRating(server, props.cookie, props.data.id, userItemRating)
		if (resp instanceof Error) {
			setRatingSubmissionStatus("errorOnSubmission");
			return;
		}

		setRatingSubmissionStatus("success");
		const ratingResp = await GetRatings(server)
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
			<div className="w-full shadow-md p-4 bg-off-white rounded-md my-4 max-h-card overflow-y-auto border-2 border-off-white break-words">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4 object-contain">
					<div className="col-span-1 mx-auto">
						<img
							className="max-h-96 object-contain"
							src={props.data.picture_url}
						/>
						<div className="flex flex-row-reverse">
							<button onClick={() => setExpandImage(true)}>
								{" "}
								[expand img]
							</button>
						</div>
					</div>

					<div className="col-span-3 bg-white p-4 rounded-md">
						<div className="md:grid md:grid-cols-3 gap-x-4">
							<div className="col-span-1">
								<h3 className="font-semibold">{props.data.title}</h3>
								{
									!props.asUser && (
										<PSpan p={props.data.user_id} span="by" />

									)
								}
								<PSpan p={props.data.date} span="date" />
								<PSpan span={"visibility"} p={props.data.private ? "private 🔐" : "public 🌎"} />
								<p className="font-bold">tags:</p>
								<div className="flex gap-2">
									{props.data.style_tags.map((item) => (
										<div className="" key={item}>{item}</div>
									))}
								</div>
							</div>
							<div className="col-span-2">
								<h4 className="font-semibold">Audience Rating:</h4>
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
												<a className="underline hover:cursor-pointer" onClick={() => setSubmitRating(true)}>{userItemRating == 0 ? "submit your rating" : "edit your rating"}</a>
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
														className="flex text-pink -mt-2 p-0 justify-between items-start"
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
													className="bg-pink text-white p-1 rounded hover:bg-black"
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
							<hr className="col-span-3 my-2" />
							{props.data.items.map((item, index) => {
								let count = index + 1;
								return (
									<>
										<div className="col-span-1" key={`col-1-${item.brand}`}>
											<h4>
												{count}.{" "}
												{item.link ? <a href={item.link} target="_blank">{item.description}</a> : <span className="hover:cursor-not-allowed text-pink">{item.description}</span>}
												
												
												
												 {/* <span className="text-pink underline">{item.description}</span>{item.link &&
													<span className="text-pink text-sm font-normal">
														<a href={item.link} target="_blank">
															{" "}
															[ LINK ]
														</a>
													</span>} */}
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
					</div>
				</div>
			</div>

			{expandImage && (
				<Modal handleClose={() => setExpandImage(false)} fullHeight={true}>
					<img src={props.data.picture_url}></img>
				</Modal>
			)}
		</>
	);
}
