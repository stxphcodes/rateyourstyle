import Link from "next/link";
import { useState, useEffect } from "react";

import { Modal } from ".";
import { Outfit } from "../../apis/get_outfits";
import { RatingDiv } from "../outfit/rating";
import { PostRating } from "../../apis/post_rating";
import { GetRatingsByOutfit, Rating } from "../../apis/get_ratings";
import { PostReply } from "../../apis/post_reply";
import { GetReplies, Reply } from "../../apis/get_replies";
import { OutfitContent } from "../outfit/content";

export function OutfitModal(props: {
  clientServer: string;
  cookie?: string;
  handleClose: any;
  data: Outfit;
  asUser: boolean;
  userRating: Rating | null;
}) {
  const [submitRating, setSubmitRating] = useState<boolean>(false);
  const [userOutfitRating, setUserOutfitRating] = useState<number>(
    props.userRating?.rating ? props.userRating.rating : 0
  );

  const [userOutfitReview, setOutfitReview] = useState<string>(
    props.userRating?.review ? props.userRating.review : ""
  );
  const [userReviewMissing, setUserReviewMissing] = useState<boolean>(false);
  const [allRatings, setAllRatings] = useState<Rating[] | null>(null);

  const [viewReplies, setViewReplies] = useState<Map<string, Reply[]>>(
    new Map<string, Reply[]>()
  );

  const [replyKey, setReplyKey] = useState<string>("");
  const [reply, setReply] = useState<string>("");

  const handleSubmitRating = async (e: any) => {
    e.preventDefault();

    if (!props.cookie) {
      return;
    }

    if (userOutfitReview == "") {
      setUserReviewMissing(true);
      return;
    }

    setUserReviewMissing(false);
    const resp = await PostRating(
      props.clientServer,
      props.cookie,
      props.data.id,
      userOutfitRating,
      userOutfitReview
    );
    if (resp instanceof Error) {
      return;
    }

    let ratingsResp = await GetRatingsByOutfit(
      props.clientServer,
      props.data.id
    );
    if (!(ratingsResp instanceof Error)) {
      setAllRatings(ratingsResp);
    }

    setSubmitRating(false);
  };

  const handleSubmitReply = async (e: any, key: string) => {
    if (!props.cookie) {
      return;
    }

    const resp = await PostReply(
      props.clientServer,
      props.cookie,
      replyKey,
      reply
    );
    // TODO: deal with error
    if (resp instanceof Error) {
      return;
    }

    let replies = await GetReplies(props.clientServer, props.cookie, key);
    if (!(replies instanceof Error)) {
      viewReplies.set(key, replies);
      let clone = new Map<string, Reply[]>(viewReplies.entries());
      setViewReplies(clone);
    }

    // reset to default state
    setReply("");
    setReplyKey("");
  };

  const handleViewReplies = async (e: any, key: string) => {
    if (!props.cookie) {
      return;
    }

    let replies = await GetReplies(props.clientServer, props.cookie, key);
    if (!(replies instanceof Error)) {
      viewReplies.set(key, replies);
      let clone = new Map<string, Reply[]>(viewReplies.entries());
      setViewReplies(clone);
    }
  };

  const handleHideReplies = (e: any, key: string) => {
    viewReplies.delete(key);
    let clone = new Map<string, Reply[]>(viewReplies.entries());
    setViewReplies(clone);
  };

  useEffect(() => {
    async function fetchData() {
      let ratingsResp = await GetRatingsByOutfit(
        props.clientServer,
        props.data.id
      );
      if (!(ratingsResp instanceof Error)) {
        setAllRatings(ratingsResp);
      }
    }

    fetchData();
  }, []);

  return (
    <Modal
      handleClose={props.handleClose}
      fullHeight={true}
      wideScreen={true}
      noPadding={true}
    >
      <>
        <OutfitContent outfit={props.data} />

        <div className="px-4">
          <div className="flex gap-2 items-center pt-4">
            {props.data.rating_average && (
              <RatingDiv x={props.data.rating_average} />
            )}

            <div className="">
              {!props.data.rating_count
                ? "no reviews yet"
                : `from ${props.data.rating_count} ${
                    props.data.rating_count > 1 ? "reviews" : "review"
                  } `}
            </div>
          </div>

          {!props.asUser && props.cookie && !submitRating && (
            <>
              <div className="flex gap-2 items-center">
                {userOutfitRating !== 0 && <RatingDiv x={userOutfitRating} />}
                <a
                  className="hover:cursor-pointer"
                  onClick={() => setSubmitRating(true)}
                >
                  {userOutfitRating == 0
                    ? "submit your review"
                    : "edit your review"}
                </a>
              </div>
            </>
          )}

          {!props.asUser && props.cookie && submitRating && (
            <>
              <div className="flex gap-4 items-center">
                <RatingDiv x={userOutfitRating} />
                <div className="w-fit">
                  <label>Your rating</label>
                  <input
                    id="rating"
                    type="range"
                    min="1"
                    max="5"
                    step="0.5"
                    className="h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer  p-0 m-0"
                    onChange={(e) =>
                      setUserOutfitRating(Number(e.target.value))
                    }
                    list="rating"
                    value={userOutfitRating}
                  />
                  <datalist
                    className="flex text-primary -mt-2 p-0 justify-between items-start"
                    id="rating"
                  >
                    <option className="text-xs">|</option>
                    <option className="text-xs">|</option>
                    <option className="text-xs">|</option>
                    <option className="text-xs">|</option>
                    <option className="text-xs">|</option>
                  </datalist>
                </div>
              </div>

              <div>
                <textarea
                  rows={4}
                  className="m-2 w-full md:w-1/2"
                  placeholder="Leave a comment"
                  onChange={(e) => setOutfitReview(e.target.value)}
                  value={userOutfitReview}
                ></textarea>
              </div>
              {userReviewMissing && (
                <div className="text-primary">Please leave a comment.</div>
              )}

              <button className="primaryButton" onClick={handleSubmitRating}>
                submit
              </button>
            </>
          )}

          <div className="border-t-2 border-custom-grey-brown">
            {allRatings?.map((rating) => {
              let ratingKey = rating.outfit_id + "-" + rating.user_id;
              return (
                <div className="my-3" key={ratingKey}>
                  <div className="text-xs">
                    {!rating.username ? (
                      <span>anonymous</span>
                    ) : (
                      <Link href={`/closet/${rating.username}`} passHref={true}>
                        <a className="">{rating.username}</a>
                      </Link>
                    )}{" "}
                    | {rating.date}{" "}
                  </div>
                  <div className="">
                    <span className=" text-base pr-2">{rating.rating}</span>
                    {rating.review}
                  </div>

                  {rating.reply_count && !viewReplies.has(ratingKey) ? (
                    <div
                      className="pl-4 text-xs text-custom-grey-brown cursor-pointer"
                      onClick={(e: any) => handleViewReplies(e, ratingKey)}
                    >
                      View {rating.reply_count}{" "}
                      {rating.reply_count > 1 ? "replies" : "reply"}
                    </div>
                  ) : null}

                  {viewReplies.has(ratingKey) ? (
                    <div className="pl-4 text-xs">
                      <div
                        className="text-custom-grey-brown cursor-pointer"
                        onClick={(e) => {
                          handleHideReplies(e, ratingKey);
                        }}
                      >
                        Hide replies
                      </div>
                      {viewReplies.get(ratingKey)?.map((item) => (
                        <div className="pt-2" key={item.id}>
                          <a href={`/closet/${item.username}`}>
                            {item.username}{" "}
                          </a>{" "}
                          | {item.date}
                          <div className="text-base">{item.reply}</div>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {props.cookie && replyKey !== ratingKey ? (
                    <button
                      className="text-xs pl-4 text-custom-grey-brown"
                      onClick={() => setReplyKey(ratingKey)}
                    >
                      Reply
                    </button>
                  ) : props.cookie ? (
                    <div className="pl-4">
                      <textarea
                        rows={4}
                        className="w-full"
                        placeholder="Leave a comment"
                        onChange={(e) => setReply(e.target.value)}
                        value={reply}
                      ></textarea>

                      <button
                        className="text-xs mx-2 px-1 primaryButton"
                        onClick={(e) => handleSubmitReply(e, ratingKey)}
                      >
                        reply
                      </button>
                      <button
                        className="text-xs px-1 inverseButton "
                        onClick={() => {
                          setReplyKey("");
                          setReply("");
                        }}
                      >
                        cancel
                      </button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </>
    </Modal>
  );
}
