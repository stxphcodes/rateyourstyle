import { useEffect, useState, useRef, DependencyList } from "react";
import { Outfit, OutfitItem } from "../../apis/get_outfits";
import { PostColorAnalysisImage, PostImageWithAI } from "../../apis/post_image";
import { XButton } from "../modals";
import { ntc } from "../color/ntc";
import LoadingGIF from "../icons/loader-gif";
import Cropper from "react-easy-crop";
import { Point, Area } from "react-easy-crop/types";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  Crop,
  PixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

import { MunsellColorChart } from "../color/munsell-colors";
import ImageCrop from "../img-crop/image-crop";

export const HeadShotForm = (props: {
  imageServer: string;
  imageURL: string;
  cookie: string;
  //onSubmit: any;
}) => {
  // const [file, setFile] = useState<File | null>(null);
  const [imageURL, setImageURL] = useState<string | null>(props.imageURL);

  const [error, setError] = useState<string | null>("");
  const [isLoading, setIsLoading] = useState(false);

  //   useEffect(() => {
  //     async function upload(formData: any) {
  //       const resp = await PostColorAnalysisImage(
  //         props.imageServer,
  //         formData,
  //         props.cookie
  //       );
  //       if (resp instanceof Error) {
  //         setFileError(resp.message);
  //         return;
  //       }

  //       setImageURL(resp.url);
  //       setIsLoading(false);
  //     }

  //     if (file) {
  //       const formData = new FormData();
  //       formData.append("file", file);
  //       setIsLoading(true);
  //       upload(formData);
  //     }
  //   }, [props.cookie, file]);

  return (
    <form className="">
      <div>
        Follow these tips for the best results! Please upload a headshot that
        is:
        <ul>
          <li>Front-facing</li>
          <li>Good quality</li>
          <li>Taken in natural lighting</li>
        </ul>
      </div>
      {!imageURL ? (
        <ImageCrop
          imgServer={props.imageServer}
          cookie={props.cookie}
          setImageURL={setImageURL}
          setIsLoading={setIsLoading}
          setError={setError}
        />
      ) : (
        <img
          alt={"headshot"}
          src={imageURL}
          className="object-cover"
          style={{
            height: "600px",
            borderRadius: "50%",
            //border: `100px solid ${colorBorder}`,
          }}
        />
      )}
      {/* {imageURL ? (
        <div className="flex flex-wrap gap-4">
          <img
            alt={"outfit image to post"}
            src={URL.createObjectURL(file as File)}
            className="object-cover"
            style={{
              height: "600px",
              border: `100px solid ${colorBorder}`,
            }}
          />

          <button
            onClick={(e) => {
              e.preventDefault();
              setFile(null);
              setImageURL("");
            }}
            className="h-fit my-auto bg-black p-1 text-white rounded text-sm hover:bg-primary"
          >
            {" "}
            remove
          </button>
        </div>
      ) : (
        <>
          {fileError && (
            <>
              <div className="p-2 my-2 bg-red-500 text-white">
                Encountered error uploading image. Please{" "}
                <button
                  onClick={(e) => {
                    location.reload();
                  }}
                  className="h-fit my-auto bg-black p-1 text-white rounded text-sm hover:bg-primary"
                >
                  {" "}
                  refresh
                </button>{" "}
                the page and try again.
              </div>
            </>
          )}
          <label htmlFor="file" className="">
            For more accurate results, please choose an image that is:
            <ul className="list-disc list-inside">
              <li>A front-facing headshot</li>
              <li>High resolution</li>
              <li>Zero or limited face accessories</li>
              <li>Taken in natural lighting</li>
              <li>No filters</li>
            </ul>
          </label>

          {isLoading ? (
            <LoadingGIF />
          ) : (
            <div className="h-40 border border-black rounded content-center justify-self-center">
              <h1 className="opacity-20 text-center">Image</h1>
              <input
                className="w-full border-0"
                id="file"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
          )}
        </>
      )} */}

      <button
        className="bg-gradient hover:scale-105 font-bold py-2 px-4 rounded  w-full mt-8"
        //onClick={handleSubmit}
      >
        Submit
      </button>
    </form>
  );
};
