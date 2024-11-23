import React, { useState, useRef } from "react";

import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  Crop,
  PixelCrop,
} from "react-image-crop";
import { canvasPreview } from "./canvasPreview";

import "react-image-crop/dist/ReactCrop.css";

import { useEffect, DependencyList } from "react";
import { PostColorAnalysisImage } from "../../apis/post_image";

export function useDebounceEffect(
  fn: () => void,
  waitTime: number,
  deps?: DependencyList
) {
  useEffect(() => {
    const t = setTimeout(() => {
      fn.apply(undefined, deps);
    }, waitTime);

    return () => {
      clearTimeout(t);
    };
  }, deps);
}

// This is to demonstate how to make and center a % aspect crop
// which is a bit trickier so we use some helper functions.
function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export default function ImageCrop(props: {
  imgServer: string;
  cookie: string;
  setImageURL: any;
  setIsLoading: any;
  setError: any;
}) {
  const [imgSrc, setImgSrc] = useState("");
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();

  function onSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined); // Makes crop preview update between images.
      const reader = new FileReader();
      reader.addEventListener("load", () =>
        setImgSrc(reader.result?.toString() || "")
      );
      reader.readAsDataURL(e.target.files[0]);
    }
  }

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 9 / 12));
  }

  async function onDownloadCropClick() {
    props.setIsLoading(true);
    const image = imgRef.current;
    const previewCanvas = previewCanvasRef.current;
    if (!image || !previewCanvas || !completedCrop) {
      throw new Error("Crop canvas does not exist");
    }

    // This will size relative to the uploaded image
    // size. If you want to size according to what they
    // are looking at on screen, remove scaleX + scaleY
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const offscreen = new OffscreenCanvas(
      completedCrop.width * scaleX,
      completedCrop.height * scaleY
    );
    const ctx = offscreen.getContext("2d");
    if (!ctx) {
      props.setError("No 2d context");
      props.setIsLoading(false);
      return;
    }

    ctx.drawImage(
      previewCanvas,
      0,
      0,
      previewCanvas.width,
      previewCanvas.height,
      0,
      0,
      offscreen.width,
      offscreen.height
    );
    // You might want { type: "image/jpeg", quality: <0 to 1> } to
    // reduce image size
    const blob = await offscreen.convertToBlob({
      type: "image/png",
    });

    var file = new File([blob], "file.png");
    const formData = new FormData();
    formData.append("file", file);

    const resp = await PostColorAnalysisImage(
      props.imgServer,
      formData,
      props.cookie
    );

    if (!(resp instanceof Error)) {
      props.setImageURL(resp.url);
      props.setIsLoading(false);
      props.setError("");
      return;
    }

    props.setError(resp.message);
    props.setIsLoading(false);
  }

  useDebounceEffect(
    async () => {
      if (
        completedCrop?.width &&
        completedCrop?.height &&
        imgRef.current &&
        previewCanvasRef.current
      ) {
        // We use canvasPreview as it's much faster than imgPreview.
        canvasPreview(
          imgRef.current,
          previewCanvasRef.current,
          completedCrop,
          1,
          0
        );
      }
    },
    100,
    [completedCrop]
  );

  return (
    <div className="App">
      {!imgSrc ? (
        <div className="Crop-Controls">
          <div className="h-40 border border-black rounded content-center justify-self-center">
            <h1 className="opacity-20 text-center">Image</h1>
            <input
              className="w-full border-0"
              id="file"
              type="file"
              accept="image/*"
              onChange={onSelectFile}
            />
          </div>
          {/* <input type="file" accept="image/*" onChange={onSelectFile} /> */}
        </div>
      ) : (
        <div className="flex gap-4 items-center">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            // minWidth={400}
            minHeight={100}
            circularCrop
          >
            <img ref={imgRef} alt="Crop me" src={imgSrc} onLoad={onImageLoad} />
          </ReactCrop>

          {!!completedCrop && (
            <div className="">
              <canvas
                ref={previewCanvasRef}
                style={{
                  border: "1px solid black",
                  objectFit: "contain",
                  borderRadius: "50%",
                  width: completedCrop.width,
                  height: completedCrop.height,
                }}
              />

              <button
                className="primaryButton"
                style={{ margin: "auto" }}
                onClick={(e) => {
                  e.preventDefault();
                  onDownloadCropClick();
                }}
              >
                Save
              </button>
            </div>
          )}
        </div>
      )}
      {/* <div className="Crop-Controls">
        <div className="h-40 border border-black rounded content-center justify-self-center">
          <h1 className="opacity-20 text-center">Image</h1>
          <input
            className="w-full border-0"
            id="file"
            type="file"
            accept="image/*"
            onChange={onSelectFile}
          />
        </div>
      </div> */}
    </div>
  );
}
