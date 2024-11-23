import { useState } from "react";
import ImageCrop from "../img-crop/image-crop";

export const HeadShotForm = (props: {
  imageServer: string;
  cookie: string;
  setImageURL: any;
}) => {
  const [error, setError] = useState<string | null>("");
  const [isLoading, setIsLoading] = useState(false);

  return (
    <form className="">
      <h3>Step 1. Upload a headshot</h3>
      <div>
        Follow these tips for the best results! Please upload a headshot that
        is:
        <ul>
          <li>Front-facing</li>
          <li>Good quality</li>
          <li>Taken in natural lighting</li>
        </ul>
      </div>
      <ImageCrop
        imgServer={props.imageServer}
        cookie={props.cookie}
        setImageURL={props.setImageURL}
        setIsLoading={setIsLoading}
        setError={setError}
      />
    </form>
  );
};
