import { Outfit } from "../../apis/get_outfits";
import { useState } from "react";
import { OutfitItemList } from "./item-list";

export function PSpan(props: { span: string; p: string }) {
  return (
    <p>
      <span className="font-bold">{props.span}: </span>
      {props.p}
    </p>
  );
}

export function OutfitContent(props: { outfit: Outfit }) {
  const [viewItems, setViewItems] = useState(true);
  return (
    <div className="md:flex md:gapx-2 md:align-start md:flex-row w-full">
      <div className="basis-1/2">
        <img
          alt={props.outfit.description}
          className="mb-2"
          src={props.outfit.picture_url}
        ></img>
      </div>

      <div className="basis-1/2 w-full">
        <div className="px-4 mb-4">
          <div>
            {props.outfit.username ? (
              <a className="" href={`/closet/${props.outfit.username}`}>
                {props.outfit.username}&apos;s closet
              </a>
            ) : (
              "anonymous"
            )}
            <span className=" text-xs">
              {" | "} {props.outfit.date}
            </span>
          </div>

          <div className="text-2xl">{props.outfit.title}</div>
          <div className="flex gap-2">
            {props.outfit.style_tags.map((item) => (
              <div className="" key={item}>
                {item}
              </div>
            ))}
          </div>

          <div className="">
            <a
              className=""
              onClick={(e) => {
                e.preventDefault();
                setViewItems(!viewItems);
              }}
            >
              {!viewItems
                ? `View ${props.outfit.items.length} Oufit Item${
                    props.outfit.items.length > 1 ? "s" : ""
                  }`
                : `Hide Outfit Items`}
            </a>
          </div>

          {viewItems && (
            <div className="pl-6">
              <OutfitItemList outfitItems={props.outfit.items} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
