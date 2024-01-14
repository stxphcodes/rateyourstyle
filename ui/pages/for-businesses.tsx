import { GetServerSideProps } from 'next';

import { GetUsername } from '../apis/get_user';
import { Footer } from '../components/footer';
import { Navbar } from '../components/navarbar';
import { GetServerURL } from '../apis/get_server';
import { PageMetadata } from './_app';
import Link from 'next/link';

type Props = {
	cookie: string;
	error: string | null;
	//username: string;
	clientServer: string;
	metadata: PageMetadata;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
	let props: Props = {
		cookie: "",
		error: null,
		clientServer: "",
		metadata: {
			title: "RateYourStyle Business",
			description: "Collect user generated content for your business on RateYourStyle."
		}
	};

	let server = GetServerURL()
	if (server instanceof Error) {
		props.error = server.message;
		return { props };
	}

	let cookie = context.req.cookies["rys-login"];
	props.cookie = cookie ? cookie : "";

	let clientServer = GetServerURL(true)
	if (clientServer instanceof Error) {
		props.error = clientServer.message;
		return { props };
	}

	props.clientServer = clientServer

	return { props };
};


export default function ForBusinessesPage({ cookie,  clientServer }: Props) {
	return (
		<>
			<Navbar clientServer={clientServer} cookie={cookie} />
			<main className="mt-10 ">
				<section className="bg-primary text-white ">
					<div className="grid grid-cols-1 md:grid-cols-7 items-center gap-x-0 md:gap-x-8">
						<div className="col-span-5 px-3 md:px-8 py-16">
							<h1 >Consumers Trust User Generated Content (UGC)</h1>
							<h2 className="text-lg mt-4 ">UGC is any type of online material about products or brands that&apos;s made by customers without input from companies. UGC is valuable because it is authentic, engaging and influential for other consumers. In fact, 92% of shoppers trust UGC more than traditional advertising and those who interact with UGC are 2x more likely to convert.
							</h2>
						</div>
						<img src={"/store-customer.jpeg"} className="md:col-span-2 w-full h-auto"></img>
					</div>
				</section>

				<section className="bg-white my-8 md:pr-8 md:py-0 p-4">
					<div className="grid grid-cols-1 md:grid-cols-5 items-center gap-x-0 md:gap-x-8">
						<img src={"/ratings.jpeg"} className="hidden md:block md:col-span-2 w-full md:h-auto"></img>
						<div className="col-span-3 ">
							<h1>How It Works</h1>
							<div className="my-4">
								<h3>1. Collect</h3>
								<div>Create a business account on RateYourStyle to automatically start a page for your business. Let your customers know that they can post an outfit on RateYourStyle with your items, and they can submit it to your business page to be featured.</div>
							</div>

							<div className="my-4">
								<h3>2. Manage</h3>
								<div>Moderate outfit submissions and item reviews directly on your page when you log into your business account. This is just to ensure that customer submissions follow guidelines such as correctly tagging businesses, and that reviews are real and relevant.</div>
							</div>
							<div className="my-4">
								<h3>3. Analyze</h3>
								<div>Gain insight to what your customers think about your products by analyzing the outfit submissions and their ratings & reviews.</div>
							</div>

							<div className="my-4">
								<h3>4. Engage</h3>
								<div>Foster a tight knit community with your customers by engaging with their outfit submissions. You can like their outfits and leave comments. Another way to engage with your customers is to host campaigns that will reward them when they post outfits.</div>
							</div>

							<div className="bg-background rounded p-4">The quickest way to get started is to submit a<Link href="/request-closet" passHref={true}>
                                <a className="mx-2">Closet Request</a>
                            </Link>form and make sure to check the owner checkbox!  If you have any questions, please email sitesbystephanie@gmail.com . </div>
							
						</div>
					</div>
				</section>
			</main>
			<Footer />
		</>
	);
}
