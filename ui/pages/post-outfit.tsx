import {GetServerSideProps} from 'next';
import {useEffect, useState} from 'react';

import {Campaign, GetCampaigns} from '../apis/get_campaigns';
import {OutfitItem} from '../apis/get_outfits';
import {GetUsername} from '../apis/get_user';
import {PostImage} from '../apis/post_image';
import {Footer} from '../components/footer';
import {Modal, XButton} from '../components/modals';
import {Navbar} from '../components/navarbar';

type Props = {
	campaigns: Campaign[] | null;
	cookie: string;
	username: string;
	error: string | null;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
	let props: Props = {
		campaigns: null,
		cookie: "",
		username: "",
		error: null,
	};

	let cookie = context.req.cookies["rys-login"];
	props.cookie = cookie ? cookie : "";

	const resp = await GetCampaigns();
	if (resp instanceof Error) {
		props.error = resp.message;
		return {props};
	}

	props.campaigns = resp;

	if (cookie) {
		const usernameResp = await GetUsername(cookie);
		if (!(usernameResp instanceof Error)) {
			props.username = usernameResp
		}
	}



	return {props};
};

function validateForm(imageURL: string | null, caption: string, tags: string, outfitItems: OutfitItem[]) {
	if (!imageURL || !caption || outfitItems.length == 0 || !tags) {
		return false;
	}


	let itemMissingField = false;
	outfitItems.forEach((item) => {
		if (!item.description || !item.brand || item.review) {
			itemMissingField = true;
			return;
		}
	});

	if (itemMissingField) {
		return false;
	} else {
		return true;
	}
}

function PostOutfit({campaigns, cookie, username, error}: Props) {
	const [file, setFile] = useState<File | null>(null);
	const [imageURL, setImageURL] = useState<string | null>("");
	const [fileError, setFileError] = useState<string | null>(null);
	const [outfitCaption, setOutfitCaption] = useState<string>("");
	const [styleTags, setStyleTags] = useState<string>("");
	const [formValidationError, setFormValidationError] =
		useState("notSubmitted");

	const [outfitItems, setOutfitItems] = useState<OutfitItem[]>([
		{
			brand: "",
			description: "",
			size: "",
			price: "",
			review: "",
			rating: 2.5,
			link: "",
		},
	]);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		e.preventDefault();
		if (e.target.files) {
			setFile(e.target.files[0]);
		}
	};

	const handleFormInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.id == "caption") {
			setOutfitCaption(e.target.value);
		}
		if (e.target.id == "tags") {
			setStyleTags(e.target.value);
		}
	};

	const handleItemChange = (
		e: React.ChangeEvent<HTMLInputElement>,
		index: number
	) => {
		let item = outfitItems[index];

		if (e.target.id == "description") {
			item.description = e.target.value;
		}

		if (e.target.id == "rating") {
			item.rating = Number(e.target.value);
		}

		setOutfitItems([
			...outfitItems.slice(0, index),
			item,
			...outfitItems.slice(index + 1),
		]);
	};

	const handleAddItem = (e) => {
		e.preventDefault();
		setOutfitItems([
			...outfitItems,
			{
				brand: "",
				description: "",
				size: "",
				price: "",
				review: "",
				rating: 2.5,
				link: "",
			},
		]);
	};

	const handleRemoveItem = (e: any, index: number) => {
		e.preventDefault();
		setOutfitItems([
			...outfitItems.splice(0, index),
			...outfitItems.splice(index + 1),
		]);
	};

	const handleSubmit = (e: any) => {
		e.preventDefault();

		if (validateForm(imageURL, outfitCaption, styleTags, outfitItems)) {
			setFormValidationError("submitted");
			console.log("this is outfit item");
			console.log(outfitItems);
		} else {
			setFormValidationError("missingFields");
		}
	};

	useEffect(() => {
		async function upload(formData: any) {
			const resp = await PostImage(formData, cookie);
			if (resp instanceof Error) {
				setFileError(resp.message);
				return;
			}

			setImageURL(resp);
		}

		if (file) {
			const formData = new FormData();
			formData.append("file", file);

			upload(formData);
		}
	}, [file]);

	if (fileError) {
		return <h1>File Error {fileError}</h1>;
	}

	return (
		<>
			<Navbar cookie={cookie} username={username} />

			<main className="mt-6 p-8 w-3/4">
				<section className="mb-8">
					<h1>Outfit Post</h1>
					{!username &&
						<div className="bg-red-700 p-2 rounded text-white">
							You are not currently signed into an account. You can still create a post but it will be difficult to edit it later on. To make it easier to track your posts, please sign in or create an account if you don't have one!</div>
					}
				</section>
				<form className=" shadow px-4 py-8 border-off-white border-2">
					{imageURL ? (
						<>
							<img src={imageURL} className="" />

							<button
								onClick={(e) => {
									e.preventDefault();
									setFile(null);
									setImageURL("");
								}}
							>
								{" "}
								remove
							</button>
						</>
					) : (
						<>
							<label htmlFor="file" className="">
								Choose an image
							</label>
							<input
								id="file"
								type="file"
								accept="image/*"
								onChange={handleFileChange}
							/>
							<label className="text-pink italic font-normal">Required</label>
						</>
					)}

					<div className="my-4">
						<label className="" htmlFor="caption">
							Outfit Caption
						</label>
						<input
							className="w-full"
							id="caption"
							type="text"
							placeholder="Caption"
							value={outfitCaption}
							onChange={handleFormInput}
						></input>
						<label className="text-pink italic font-normal">Required</label>
					</div>

					<div className="my-4">
						<label>
							Select a tag from the options below or enter your own. Start tags
							with '#'
						</label>
						<input
							className="w-full"
							id="tags"
							type="text"
							placeholder="Ex. #athleisure #loungewear"
							value={styleTags}
							onChange={handleFormInput}
						></input>
						<label className="text-pink italic font-normal">Required</label>
						<div className="flex gap-2 mt-2">
							{campaigns &&
								campaigns.map((item) => (
									<button
										className={`${styleTags.includes(item.tag)
											? "bg-pink text-white"
											: "bg-white text-pink"
											} border-2 border-pink p-2 rounded`}
										onClick={(e) => {
											e.preventDefault();
											if (!styleTags.includes(item.tag)) {
												setStyleTags(styleTags.concat(item.tag + " "));
											} else {
												let index = styleTags.indexOf(item.tag);
												setStyleTags(styleTags.replace(item.tag, ""));
											}
										}}
									>
										{item.tag}
									</button>
								))}
						</div>
					</div>

					<div className="mb-4">
						<h5>Outfit Items</h5>
						<label>
							Describe and rate the items that appear in your outfit. For
							example: shoes, accessories, tops and bottoms are all considered
							one item each. <br />
							At least one outfit item is required.
						</label>
						<ul>
							{outfitItems.map((item, index) => {
								let displayCount = index + 1;
								return (
									<li className="shadow border-2 border-off-white my-2 rounded-lg p-4 ">
										<div className="flex items-start justify-between">
											<h6 className="mx-2">Item #{displayCount}.</h6>
											<XButton
												onClick={(e: any) => handleRemoveItem(e, index)}
											/>
										</div>
										<OutfitItemForm
											item={item}
											index={index}
											handleItemChange={handleItemChange}
										/>
									</li>
								);
							})}
						</ul>
						<button
							onClick={handleAddItem}
							className="p-2 bg-pink text-white rounded float-right"
						>
							add item
						</button>
					</div>

					<button
						className="bg-pink hover:bg-black text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full mt-8"
						type="button"
						onClick={handleSubmit}
					>
						Submit
					</button>
				</form>
			</main >
			{formValidationError == "missingFields" && (
				<Modal handleClose={() => setFormValidationError("notSubmitted")}>
					<div>Form missing required fields</div>
				</Modal>
			)
			}
			<Footer />
		</>
	);
}

function OutfitItemForm(props: {
	item: OutfitItem;
	index: number;
	handleItemChange: any;
}) {
	return (
		// <div className="grid grid-cols-3 gap-4">
		// 	<label className="col-span-1">Please describe the item in a few words.</label>
		// 	<div className="col-span-2">
		// 		<input
		// 			className="w-full"
		// 			id="description"
		// 			type="text"
		// 			placeholder="Description"
		// 			onChange={(e) => props.handleItemChange(e, props.index)}
		// 			value={props.item.description}
		// 		></input>
		// 		<label htmlFor="Email" className="text-pink italic font-normal">
		// 			Required
		// 		</label>
		// 	</div>

		// 	<label className="mt-2 col-span-1">
		// 		What brand is the item or where is it from?
		// 	</label>
		// 	<div className="col-span-2">
		// 		<input
		// 			className="w-full"
		// 			id="brand"
		// 			type="text"
		// 			placeholder="Brand"
		// 		></input>
		// 		<label htmlFor="Email" className="text-pink italic font-normal">
		// 			Required
		// 		</label>
		// 	</div>

		// 	<label className="mt-2">Link to the item</label>
		// 	<input
		// 		className="w-full mb-2 col-span-2"
		// 		id="caption"
		// 		type="text"
		// 		placeholder="Link"
		// 	></input>

		// 	<label>Item Size</label>
		// 	<input
		// 		className="w-full col-span-2"
		// 		id="caption"
		// 		type="text"
		// 		placeholder="Size"
		// 	></input>

		// 	<label>Purchased Price</label>
		// 	<input
		// 		className="w-full col-span-2"
		// 		id="caption"
		// 		type="text"
		// 		placeholder="Price"
		// 	></input>

		// 	<label>Your rating</label>
		// 	<div className="flex gap-4 items-center col-span-2">
		// 		<div className="w-fit">

		// 			<input
		// 				id="rating"
		// 				type="range"
		// 				min="1"
		// 				max="5"
		// 				step="0.5"
		// 				className="h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer  p-0 m-0"
		// 				onChange={(e) => props.handleItemChange(e, props.index)}
		// 				list="rating"
		// 				value={props.item.rating}
		// 			/>
		// 			<datalist
		// 				className="flex text-pink -mt-2 p-0 justify-between items-start"
		// 				id="rating"
		// 			>
		// 				<option className="text-xs">|</option>
		// 				<option className="text-xs">|</option>
		// 				<option className="text-xs">|</option>
		// 				<option className="text-xs">|</option>
		// 				<option className="text-xs">|</option>
		// 			</datalist>
		// 		</div>
		// 		<h1 className="text-pink">{props.item.rating}</h1>
		// 	</div>

		// 	<label className="mt-2">Your Review</label>
		// 	<div className="col-span-2">
		// 		<textarea className="w-full" id="brand" placeholder="Review"></textarea>
		// 		<label htmlFor="Email" className="text-pink italic font-normal">
		// 			Required
		// 		</label>
		// 	</div>
		// </div>

		<div className="grid grid-cols-2 gap-4">
			<div className="col-span-1">
				<label>Please describe the item in a few words.</label>
				<input
					className="w-full"
					id="description"
					type="text"
					placeholder="Description"
					onChange={(e) => props.handleItemChange(e, props.index)}
					value={props.item.description}
				></input>
				<label htmlFor="Email" className="text-pink italic font-normal">
					Required
				</label>

				<label className="mt-2">
					What brand is the item or where is it from?
				</label>
				<input
					className="w-full"
					id="brand"
					type="text"
					placeholder="Brand"
				></input>
				<label htmlFor="Email" className="text-pink italic font-normal">
					Required
				</label>

				<label className="mt-2">Link to the item</label>
				<input
					className="w-full mb-2"
					id="caption"
					type="text"
					placeholder="Link"
				></input>

				<div className="flex gap-4">
					<div>
						<label>Item Size</label>
						<input
							className="w-full"
							id="caption"
							type="text"
							placeholder="Size"
						></input>
					</div>

					<div>
						<label>Purchased Price</label>
						<input
							className="w-full"
							id="caption"
							type="text"
							placeholder="Price"
						></input>
					</div>
				</div>
			</div>

			<div className="col-span-1">
				<div className="flex gap-4 items-center">
					<div className="w-fit">
						<label>Your rating</label>
						<input
							id="rating"
							type="range"
							min="1"
							max="5"
							step="0.5"
							className="h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer  p-0 m-0"
							onChange={(e) => props.handleItemChange(e, props.index)}
							list="rating"
							value={props.item.rating}
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
					<h1 className="text-pink">{props.item.rating}</h1>
				</div>

				<label className="mt-2">Your Review</label>
				<textarea rows={4} className="w-full" id="brand" placeholder="Review"></textarea>
				<label htmlFor="Email" className="text-pink italic font-normal">
					Required
				</label>
			</div>
		</div>
	);
}

export default PostOutfit;
