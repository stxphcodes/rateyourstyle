export function Footer() {
  return (
    <footer className="bottom-0 w-full m-auto grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-black text-white text break-words">
      <div className="col-span-1">
        <h6>RateYourStyle&copy; 2024</h6>
        <div>💌 rateyourstyle@gmail.com</div>
        <a
          href="https://www.buymeacoffee.com/rateyourstyle"
          target="_blank"
          className="text-custom-pink"
        >
          ☕ Buy me a coffee
        </a>
      </div>
      <div className="col-span-2">
        <h6>About RateYourStyle</h6>
        <div className="text-xs">
          Get style feedback on RateYourStyle through outfit reviews and keep
          track of the clothes you wear through our virtual closet, a
          database-like table that takes inventory of your clothes and uses data
          science to create graphs about your closet.
        </div>
      </div>
    </footer>
  );
}
