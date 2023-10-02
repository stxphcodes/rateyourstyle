import { useState } from 'react';

import { Outfit } from '../apis/get_outfits';
import { Rating } from '../apis/get_ratings';
import { Modal } from './modals';

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
	data: Outfit;
	ratings: Rating[] | null;
	username?: string;
	asUser?: boolean;
}) {
	const [expandImage, setExpandImage] = useState<boolean>(false);
	const [submitRating, setSubmitRating] = useState<boolean>(false);
	const [userItemRating, setUserItemRating] = useState<number>(2.5);

	let avg: number | null = null;
	if (props.ratings) {
		let ratingsArr = props.ratings.map((item) => Number(item.rating));
		avg = average(ratingsArr);
	}

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
							<div className="my-2 col-span-1">
								<h3 className="font-semibold">{props.data.title}</h3>
								{
									!props.asUser && (
										<PSpan p={props.data.user_id} span="by" />

									)
								}
								<PSpan p={props.data.date} span="date" />
								<p className="font-bold">tags:</p>
								<div className="flex gap-2">
									{props.data.style_tags.map((item) => (
										<div className="" key={item}>{item}</div>
									))}
								</div>
							</div>
							<div className="col-span-2">
								<div className="flex items-center">
									{!avg ? (
										<>
											<Rating x={0} />
											<div className="mx-2">no ratings submitted yet</div>
										</>
									) : (
										<>
											<Rating x={avg} />
											<div className="mx-2">
												from {props.ratings && props.ratings.length} ratings
											</div>
										</>
									)}
								</div>

								{!props.asUser && (
									<div className="flex gap-4 items-center">
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
											onClick={(e) => {
												e.preventDefault();
												setSubmitRating(false);
											}}
										>
											submit
										</button>
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
												{count}.{" "} <span className="underline">{item.description}</span>{item.link &&
													<span className="text-pink text-sm font-normal">
														<a href={item.link} target="_blank">
															{" "}
															[ LINK ]
														</a>
													</span>}
											</h4>
											<PSpan p={item.brand} span="from" />
											<PSpan p={item.size ? item.size : "n/a"} span="size" />
											<PSpan p={item.price ? item.price : "n/a"} span="price" />
										</div>

										<div className="col-span-2" key={`col-2-${item.brand}`}>
											<div className="flex items-start">
												<Rating x={item.rating} small={true} />

												<div className="mx-2 break-words">{item.review}</div>
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
