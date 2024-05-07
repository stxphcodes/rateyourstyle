import { useState } from "react";
import Link from "next/link";

import { Outfit } from "../../apis/get_outfits";
import { Rating } from "../../apis/get_ratings";
import { VerifiedCheckIcon } from "../icons/verified-check-icon";
import { OutfitModal } from "../modals/outfit";
import { RatingDiv } from "./rating";

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

  return (
    <>
      <div className="shadow-sm shadow-custom-tan border-b-2 border-custom-tan  break-words bg-white hover:scale-105">
        <div className="h-72 sm:h-96 overflow-hidden hover:cursor-pointer">
          <img
            alt={props.data.description}
            onClick={() => setExpandImage(true)}
            className="object-cover w-full h-full"
            src={props.data.picture_url_resized}
          />
        </div>

        <div className="p-2">
          <div className="whitespace-nowrap text-ellipsis overflow-hidden">
            <div className="text-sm">
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
            {props.data.title}
          </div>

          <a
            className="flex items-center  gap-2 my-2 text-sm"
            onClick={() => setExpandImage(true)}
          >
            {props.data.rating_average && (
              <RatingDiv x={props.data.rating_average} small={true} />
            )}

            {!props.data.rating_count
              ? "no reviews yet"
              : `from ${props.data.rating_count} ${
                  props.data.rating_count > 1 ? "reviews" : "review"
                } `}
          </a>

          <a
            onClick={(e) => {
              e.preventDefault();
              setExpandImage(!expandImage);
            }}
          >
            View {props.data.items.length} Oufit Item
            {props.data.items.length > 1 ? "s" : ""}
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
