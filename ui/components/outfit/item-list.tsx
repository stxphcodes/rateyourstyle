import { OutfitItem } from "../../apis/get_outfits";
import { ColorDiv } from "../color/color-div";
import { PSpan } from "./content";
import { RatingDiv } from "./rating";

export function OutfitItemList(props: { outfitItems: OutfitItem[] }) {
  return (
    <>
      {props.outfitItems.map((item, index) => {
        let count = index + 1;
        return (
          <div className="px-2 py-1" key={`col-1-${item.brand}`}>
            <h6 className="capitalize">
              {count}.{" "}
              {item.link ? (
                <a href={item.link} target="_blank" className="">
                  {item.description}
                </a>
              ) : (
                <span className="hover:cursor-not-allowed">
                  {item.description}
                </span>
              )}
            </h6>

            <ColorDiv
              hex={item.color_hex}
              name={item.color_name}
              color={item.color}
            />

            {item.brand && <PSpan p={item.brand} span="Brand" />}
            {item.store && <PSpan p={item.store} span="Store" />}
            <PSpan p={item.size ? item.size : "n/a"} span="Size" />
            <PSpan p={item.price ? item.price : "n/a"} span="Price" />

            <div className="flex items-start">
              <RatingDiv x={item.rating} small={true} />
              <div className="mx-2 break-words">&quot;{item.review}&quot;</div>
            </div>

            {count !== props.outfitItems.length && <hr className="my-1" />}
          </div>
        );
      })}
    </>
  );
}
