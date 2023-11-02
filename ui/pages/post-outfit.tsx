import { GetServerSideProps } from 'next';
import { useEffect, useState } from 'react';
import Link from 'next/link';

import { Campaign, GetCampaigns } from '../apis/get_campaigns';
import { Outfit, OutfitItem } from '../apis/get_outfits';
import { GetUsername } from '../apis/get_user';
import { PostImage } from '../apis/post_image';
import { PostOutfit } from '../apis/post_outfit';
import { Footer } from '../components/footer';
import { Modal, XButton } from '../components/modals';
import { Navbar } from '../components/navarbar';
import { GetServerURL } from '../apis/get_server';

type Props = {
	campaigns: Campaign[] | null;
	cookie: string;
	error: string | null;
	username: string;
	clientServer: string;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
	let props: Props = {
		campaigns: null,
		cookie: "",
		error: null,
		username: "",
		clientServer: "",
	};

	let server = GetServerURL()
    if (server instanceof Error) {
        props.error = server.message; 
        return {props};
    }

	let cookie = context.req.cookies["rys-login"];
	props.cookie = cookie ? cookie : "";

	if (props.cookie) {
		const usernameResp = await GetUsername(server, props.cookie);
		if (!(usernameResp instanceof Error)) {
			props.username = usernameResp;
		}
	}

	const resp = await GetCampaigns(server);
	if (resp instanceof Error) {
		props.error = resp.message;
		return { props };
	}
	props.campaigns = resp;

	let clientServer = GetServerURL(true)
	if (clientServer instanceof Error) {
		props.error = clientServer.message; 
        return {props};
	}

	props.clientServer = clientServer

	return { props };
};

function validateForm(
	imageURL: string | null,
	caption: string,
	tags: string,
	outfitItems: OutfitItem[]
) {
	if (!imageURL || !caption || outfitItems.length == 0 || !tags) {
		return false;
	}

	let itemMissingField = false;
	outfitItems.forEach((item) => {
		if (!item.description || !item.brand || !item.review) {
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

function PostOutfitPage({ campaigns, cookie, username, clientServer, error }: Props) {
	const [file, setFile] = useState<File | null>(null);
	const [imageURL, setImageURL] = useState<string | null>("");
	const [fileError, setFileError] = useState<string | null>("");
	const [outfitCaption, setOutfitCaption] = useState<string>("");
	const [privateMode, setPrivateMode] = useState<boolean>(false);
	const [styleTags, setStyleTags] = useState<string>("");
	const [formSubmissionStatus, setFormSubmissionStatus] = useState("");
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

	let server = GetServerURL(true)
	if (server instanceof Error) {
		server = ""
	}


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

		if (e.target.id == "review") {
			item.review = e.target.value;
		}

		if (e.target.id == "link") {
			item.link = e.target.value;
		}

		if (e.target.id == "price") {
			item.price = e.target.value;
		}

		if (e.target.id == "size") {
			item.size = e.target.value;
		}

		if (e.target.id == "brand") {
			item.brand = e.target.value;
		}

		setOutfitItems([
			...outfitItems.slice(0, index),
			item,
			...outfitItems.slice(index + 1),
		]);
	};

	const handleAddItem = (e: any) => {
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

	const handleSubmit = async (e: any) => {
		e.preventDefault();

		if (
			imageURL &&
			validateForm(imageURL, outfitCaption, styleTags, outfitItems)
		) {
			setFormSubmissionStatus("");

			let tags = styleTags.split(" ");
			let outfitId = process.env.NODE_ENV == "development" ? 
			imageURL?.replace(
				"https://storage.googleapis.com/rateyourstyle-dev/imgs/outfits/",
				""
			) : imageURL?.replace(
				"https://storage.googleapis.com/rateyourstyle/imgs/outfits/",
				""
			);
			outfitId = outfitId.split("/")[1];
			outfitId = outfitId.split(".")[0];

			let outfit: Outfit = {
				id: outfitId,
				title: outfitCaption,
				picture_url: imageURL,
				style_tags: tags,
				items: outfitItems,
				private: privateMode,
				date: "",
				user_id: "",
				description: "",
			};

			const resp = await PostOutfit(clientServer, cookie, outfit);
			if (resp instanceof Error) {
				setFormSubmissionStatus("errorOnSubmission");
			} else {
				setFormSubmissionStatus("success");
			}
		} else {
			setFormSubmissionStatus("missingFields");
		}
	};

	useEffect(() => {
		async function upload(formData: any) {
			const resp = await PostImage(clientServer, formData, cookie);
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
	}, [server, cookie, file]);

	if (error) {
        return <div>error {error} </div>;
    }

	return (
		<>
			<Navbar clientServer={clientServer} cookie={cookie} user={username} />

			<main className="mt-6 p-4 md:p-8 w-full md:w-3/4">
				<section className="my-4">
					<h1>Outfit Post</h1>
					{!username && (
						<div className="bg-red-700 p-2 rounded text-white">
							You are not currently signed into an account. You can still create
							a post but your post will be inelible for campaign giveaways since we don&apos;t have an email to contact you with if you were to win. If you are applying to a campaign, please sign in or create an account if
							you don&apos;t have one!
						</div>
					)}
					<div className="bg-off-white p-2 rounded">
						<h3>FAQs</h3>
						<div className="font-semibold mt-2">Who can see my outfit posts?</div>
						<p>Each outfit post has its own privacy setting. Private posts do{" "}<span className="underline">not</span> appear on the homepage and are not discoverable by the general public. The post is only visible to you, the creator of the post, when you log into your account However, if your post includes a campaign #tag, the sponsor of the campaign is also able view the post, regardless of the privacy setting on the post. </p>
						<div className="font-semibold mt-2">How will I be notified if I win a campaign?</div>
						<p>You will be notified via the email associated to your user account the next day after a campaign ends.</p>

					</div>
				</section>
				{formSubmissionStatus == "success" && (
					<div className="h-screen">
						<p>Your outfit was successfully submitted</p>
					</div>
				)}
				{formSubmissionStatus !== "success" && (
					<form className=" shadow px-4 py-8 border-off-white border-2">
						{imageURL ? (
							<div className="flex flex-wrap gap-4">
								<img src={imageURL} className="max-h-80" />

								<button
									onClick={(e) => {
										e.preventDefault();
										setFile(null);
										setImageURL("");
									}}
									className="h-fit my-auto bg-black p-1 text-white rounded text-sm hover:bg-pink"
								>
									{" "}
									remove
								</button>
							</div>
						) : (
							<>
								{fileError && (
									<>
										<div className="p-2 my-2 bg-red-500 text-white">
											Encountered error uploading image. Please {' '}
											<button
												onClick={(e) => {
													location.reload()
												}}
												className="h-fit my-auto bg-black p-1 text-white rounded text-sm hover:bg-pink"
											>
												{" "}
												refresh
											</button>{' '} the page and try again.
										</div>

									</>
								)}
								<label htmlFor="file" className="">
									Choose an image
								</label>
								<input
									className="w-full"
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
								Set to Private Post
							</label>

							<label className="relative inline-flex items-center cursor-pointer">
								<input
									type="checkbox"
									checked={privateMode}
									className="sr-only peer"
									value={privateMode.toString()}
									onChange={() => setPrivateMode(!privateMode)}
								/>
								<div
									className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:pink
							 rounded-full peer  peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink"
								></div>
								<span className="ml-3 text-sm font-medium text-gray-900">
									Private
								</span>
							</label>
							<label className="italic font-normal">
								Private posts are only viewable by you and the sponsor of the
								campaign if you use a campaign tag.
							</label>
						</div>

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
								Select as many tags from the options below or enter your own. Start
								tags with &apos;#&apos;
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
							<div className="flex gap-2 mt-2 flex-wrap">
								{campaigns &&
									campaigns.map((item) => (
										<button
											key={item.tag}
											className={`${styleTags.includes(item.tag)
												? "bg-pink text-white"
												: "bg-white text-pink"
												} border-2 border-pink p-2 rounded`}
											onClick={(e) => {
												e.preventDefault();
												if (!styleTags.includes(item.tag)) {
													setStyleTags(styleTags.concat(item.tag + " "));
												} else {
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
										<li
											className="shadow border-2 border-off-white my-2 rounded-lg p-4"
											key={displayCount}
										>
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
				)}
			</main>
			{formSubmissionStatus == "missingFields" && (
				<Modal handleClose={() => setFormSubmissionStatus("")}>
					<div>Form is missing required fields.</div>
				</Modal>
			)}
			{formSubmissionStatus == "errorOnSubmission" && (
				<Modal handleClose={() => setFormSubmissionStatus("")}>
					<div>
						<h3>Uh oh 😕 Our servers might be down. </h3> Please try submitting
						the form again when you are able.
						<br />
						If the error persists, please email us at sitesbystephanie@gmail.com
						.
					</div>
				</Modal>
			)}
			{formSubmissionStatus == "success" && (
				<Modal handleClose={() => location.assign("/")}>
					<div>
						<h2>Lookin&apos; chic✨ </h2>
						<p>
							Check out your post on the{" "}
							<Link href="/">
								<a className="text-pink underline">homepage</a>
							</Link>{" "}
							and rate outfits you like!
						</p>
					</div>
				</Modal>
			)}
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
		<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
			<div className="col-span-1">
				<label>Please describe the item in a few words.</label>
				<input
					className="w-full"
					id="description"
					type="text"
					placeholder="Description"
					value={props.item.description}
					onChange={(e) => props.handleItemChange(e, props.index)}
				></input>
				<label htmlFor="" className="text-pink italic font-normal">
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
					value={props.item.brand}
					onChange={(e) => props.handleItemChange(e, props.index)}
				></input>
				<label htmlFor="" className="text-pink italic font-normal">
					Required
				</label>

				<label className="mt-2">Link to the item</label>
				<input
					className="w-full mb-2"
					id="link"
					type="text"
					placeholder="Link"
					value={props.item.link}
					onChange={(e) => props.handleItemChange(e, props.index)}
				></input>

				<div className="flex gap-4">
					<div>
						<label>Item Size</label>
						<input
							className="w-full"
							id="size"
							type="text"
							placeholder="Size"
							value={props.item.size}
							onChange={(e) => props.handleItemChange(e, props.index)}
						></input>
					</div>

					<div>
						<label>Purchase Price</label>
						<input
							className="w-full"
							id="price"
							type="text"
							placeholder="Price"
							value={props.item.price}
							onChange={(e) => props.handleItemChange(e, props.index)}
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
							className="h-1  rounded-lg appearance-none cursor-pointer  p-0 m-0"
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
				<textarea
					rows={4}
					className="w-full"
					id="review"
					placeholder="Review"
					onChange={(e) => props.handleItemChange(e, props.index)}
					value={props.item.review}
				></textarea>
				<label className="text-pink italic font-normal">Required</label>
			</div>
		</div>
	);
}

export default PostOutfitPage;
