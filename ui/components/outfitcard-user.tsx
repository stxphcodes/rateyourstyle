import { useState } from 'react';

import { Outfit } from '../apis/get_outfits';
import { Rating } from '../apis/get_ratings';
import { Modal } from './modals';

function average(arr: number[]) {
	let sum = 0;
	arr.forEach((item) => (sum += item));

	return sum / arr.length;
}

export function OutfitCardUser(props: {
	data: Outfit;
	ratings: Rating[] | null;
	username?: string;
}) {
	const [expandImage, setExpandImage] = useState<boolean>(false);

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
							className="h-96 md:h-fit md:object-contain"
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
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className="col-span-1">
								<h3>{props.data.title}</h3>
								<p>
									<span className="font-bold font-sans">date:</span>{" "}
									{props.data.date}
								</p>
								<h6>tags:</h6>
								<div className="flex gap-2">
									{props.data.style_tags.map((item) => (
										<div className="">{item}</div>
									))}
								</div>
							</div>
							<div className="col-span-2">
								<div className="flex items-center">
									{!avg ? (
										<>
											<h1 className="text-pink">?</h1>
											<div className="mx-2">no ratings submitted yet</div>
										</>
									) : (
										<>
											<h1 className="text-pink">{avg}</h1>
											<div className="mx-2">
												from {props.ratings && props.ratings.length} ratings
											</div>
										</>
									)}
								</div>
							</div>
							<h5 className="col-span-1">Items</h5>
							<h5 className="col-span-2">Review</h5>
							{props.data.items.map((item) => (
								<>
									<div className="col-span-1" key={`col-1-${item.brand}`}>
										<h6 className="underline">{item.description}</h6>
										{item.link && (
											<h6 className="text-pink">
												<a href={item.link} target="_blank">
													{" "}
													[ LINK ]
												</a>
											</h6>
										)}
										<p>
											<span className="font-bold">from: </span>
											{item.brand}
										</p>
										<p>
											<span className="font-bold">size: </span>
											{item.size ? item.size : "n/a"}
										</p>
										<p>
											<span className="font-bold">price: </span>
											{item.price ? item.price : "n/a"}
										</p>
									</div>

									<div className="col-span-2" key={`col-2-${item.brand}`}>
										<div className="flex items-start">
											<h3 className="text-pink ">{item.rating}</h3>

											<div className="mx-2 break-words">{item.review}</div>
										</div>
									</div>
								</>
							))}
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
