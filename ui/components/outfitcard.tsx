import { useState } from "react";

import { Outfit, OutfitItem } from "../apis/get_outfits";
import { GetRatings, GetRatingsByOutfit, Rating } from "../apis/get_ratings";

import { VerifiedCheckIcon } from "./icons/verified-check-icon";
import Link from "next/link";
import { OutfitModal } from "./outfit-modal";
import { ColorDiv } from "./color/color-div";

export function RatingDiv(props: { x: number; small?: boolean }) {
  return (
    <div
      style={{ fontSize: props.small ? "18px" : "30px" }}
      className="text-primary"
    >
      {props.x == 0 ? "" : props.x}
    </div>
  );
}

function PSpan(props: { span: string; p: string }) {
  return (
    <p>
      <span className="font-bold">{props.span}: </span>
      {props.p}
    </p>
  );
}

export function OutfitCard(props: {
  cookie: string;
  data: Outfit;
  userRating: Rating | null;
  username?: string;
  clientServer: string;
  asUser?: boolean;
  verifiedBusiness: boolean;
}) {
  const [expandImage, setExpandImage] = useState<boolean>(false);

  const [readMore, setReadMore] = useState(false);
  return (
    <>
      <div className="w-40 sm:w-72 shadow-sm border-b-2 border-background break-words">
        <div className="overflow-hidden h-72 sm:h-96 hover:cursor-pointer">
          <img
            onClick={() => setExpandImage(true)}
            className="object-cover w-full h-full"
            src={props.data.picture_url_resized}
          />
        </div>

        <div className="p-2">
          <div className="whitespace-nowrap text-ellipsis overflow-hidden">
            <div className="text-sm" style={{ fontFamily: "custom-serif" }}>
              {props.data.username ? (
                <Link href={`/closet/${props.data.username}`} passHref={true}>
                  <a className="flex flex-wrap items-center gap-1">
                    {props.data.username}&apos;s closet
                    {props.verifiedBusiness && (
                      <VerifiedCheckIcon small={true} />
                    )}
                  </a>
                </Link>
              ) : (
                "anonymous"
              )}
            </div>
            <div className="">{props.data.title}</div>
          </div>
          <div className="flex items-center mt-1">
            {props.data.rating_average && (
              <div
                className="hover:cursor-pointer mr-2"
                onClick={() => setExpandImage(true)}
              >
                <RatingDiv x={props.data.rating_average} small={true} />
              </div>
            )}
            <a
              className="text-background-2"
              onClick={() => setExpandImage(true)}
            >
              {!props.data.rating_count
                ? "no reviews yet"
                : `from ${props.data.rating_count} ${
                    props.data.rating_count > 1 ? "reviews" : "review"
                  } `}
            </a>
          </div>
        </div>
        {readMore && <OutfitItemList outfitItems={props.data.items} />}

        <div className="flex px-2 pb-1">
          <a
            className="text-primary"
            onClick={(e) => {
              e.preventDefault();
              setReadMore(!readMore);
            }}
          >
            {!readMore
              ? `View ${props.data.items.length} Oufit Item${
                  props.data.items.length > 1 ? "s" : ""
                }`
              : "Hide Outfit Items"}
          </a>
        </div>
      </div>

      {expandImage && (
        <OutfitModal
          clientServer={props.clientServer}
          cookie={props.cookie}
          handleClose={() => setExpandImage(false)}
          data={props.data}
          asUser={false}
          userRating={props.userRating}
        />
      )}
    </>
  );
}

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
