import { useEffect, useState } from "react";

import { Modal } from "./";
import { Outfit } from "../../apis/get_outfits";
import { GetOutfitsByUser } from "../../apis/get_outfits";
import Link from "next/link";
import { OutfitItem } from "../../apis/get_outfits";
import {
  BusinessOutfitSelected,
  PostBusinessOutfits,
} from "../../apis/post_businessoutfits";

export function RequestFeedbackModal(props: {
  clientServer: string;
  cookie: string;
  handleClose: any;
  closetName: string;
}) {
  return (
    <Modal handleClose={props.handleClose} wideScreen={true} fullHeight={true}>
      <>
        <h1 className="mb-8">
          Request Outfit Feedback from {props.closetName}
        </h1>

        <div>
          We&apos;re actively working on this feature! Please check back in a
          few weeks.
        </div>
      </>
    </Modal>
  );
}
