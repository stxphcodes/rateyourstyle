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

export const ColorAnalysisForm = (props: {
  clientServer: string;
  imageServer: string;
  cookie: string;
  previousItems: OutfitItem[];
  onSubmit: any;
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [imageURL, setImageURL] = useState<string | null>("");
  const [fileError, setFileError] = useState<string | null>("");
  const [isLoading, setIsLoading] = useState(false);
  const [missingFields, setMissingFields] = useState(false);

  const [colorBorder, setColorBorder] = useState("rgb(0,0,0)");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  useEffect(() => {
    async function upload(formData: any) {
      const resp = await PostColorAnalysisImage(
        props.imageServer,
        formData,
        props.cookie
      );
      if (resp instanceof Error) {
        setFileError(resp.message);
        return;
      }

      setImageURL(resp.url);
      setIsLoading(false);
    }

    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      setIsLoading(true);
      upload(formData);
    }
  }, [props.cookie, file]);

  const [crop, setCrop] = useState<Crop>();

  return (
    <form className="">
      <MunsellColorChart setColorSelected={setColorBorder} />
      {!imageURL ? (
        <ImageCrop
          imgServer={props.imageServer}
          cookie={props.cookie}
          setImageURL={setImageURL}
        />
      ) : (
        <img
          alt={"outfit image to post"}
          src={imageURL}
          className="object-cover"
          style={{
            height: "600px",
            border: `100px solid ${colorBorder}`,
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

      <div className="my-4">
        <h2>Your Results</h2>
        <div>Skintone</div>
        <div>Hair Color</div>
        <div>Eye Color</div>

        <div></div>
      </div>

      {missingFields && (
        <div className="mt-8 text-red-500 font-semibold">
          Form is missing required fields.
        </div>
      )}

      <button
        className="bg-gradient hover:scale-105 font-bold py-2 px-4 rounded  w-full mt-8"
        //onClick={handleSubmit}
      >
        Submit
      </button>
    </form>
  );
};

function validateForm(
  imageURL: string | null,
  caption: string,
  tags: string,
  outfitItems: OutfitItem[]
) {
  if (!imageURL || !caption || outfitItems.length == 0 || !tags) {
    return false;
  }

  let itemMissingField = false;
  outfitItems.forEach((item) => {
    if (!item.description || !item.brand || !item.review) {
      itemMissingField = true;
      return;
    }
  });

  if (itemMissingField) {
    return false;
  } else {
    return true;
  }
}
