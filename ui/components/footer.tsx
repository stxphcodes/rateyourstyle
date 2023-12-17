export function Footer() {
	return <div className="bottom-0 w-full m-auto grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-black text-white text break-words">
		<div className="col-span-1">
			<h6>RateYourStyle&copy; 2023</h6>
			<div>💌 sitesbystephanie@gmail.com</div>
			<a href="https://www.buymeacoffee.com/rateyourstyle" target="_blank" className="hover:text-white">☕ Buy me a coffee</a>
		</div>
		<div className="col-span-2">
			<h6 >About RateYourStyle</h6>
			<div className="text-xs">A fashion community where you can build your own virtual closet, rate & review your clothes,  and get rewarded for your style. <br /> For businesses, RateYourStyle is a one-stop platform to gather user generated content, derive meaningful market insights, and engage with consumers through rewards and feedback.
			</div>
		</div>

	</div>
}