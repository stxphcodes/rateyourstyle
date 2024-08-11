import { useEffect, useState } from "react";
import { Outfit, OutfitItem } from "../../apis/get_outfits";
import { PostImageWithAI } from "../../apis/post_image";
import { XButton } from "../../components/modals";
import { ntc } from "../../components/color/ntc";
import LoadingGIF from "../../components/icons/loader-gif";
import { OutfitItemForm } from "./outfit-item";
import { Toggle } from "../base/toggle";

export const OutfitForm = (props: {
  clientServer: string;
  imageServer: string;
  cookie: string;
  previousItems: OutfitItem[];
  onSubmit: any;
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [imageURL, setImageURL] = useState<string | null>("");
  const [fileError, setFileError] = useState<string | null>("");
  const [outfitCaption, setOutfitCaption] = useState<string>("");
  const [privateMode, setPrivateMode] = useState<boolean>(false);
  const [styleTags, setStyleTags] = useState<string>("");
  const [outfitItems, setOutfitItems] = useState<OutfitItem[]>([
    defaultOutfitItem(),
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [missingFields, setMissingFields] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleFormInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMissingFields(false);
    if (e.target.id == "caption") {
      setOutfitCaption(e.target.value);
    }
    if (e.target.id == "tags") {
      setStyleTags(e.target.value);
    }
  };

  const handleColorPick = (index: number, hex: string) => {
    let item = outfitItems[index];
    item.color_hex = hex;
    item.color = ntc.name(hex)[3];
    item.color_name = ntc.name(hex)[1];

    setOutfitItems([
      ...outfitItems.slice(0, index),
      item,
      ...outfitItems.slice(index + 1),
    ]);
  };

  const handleItemChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    setMissingFields(false);
    let item = outfitItems[index];

    item = updateItem(item, e.target.id, e.target.value);

    setOutfitItems([
      ...outfitItems.slice(0, index),
      item,
      ...outfitItems.slice(index + 1),
    ]);
  };

  const handlePreviousItemSelect = (e: any, index: number) => {
    if (e.target.value == "") {
      setOutfitItems([
        ...outfitItems.slice(0, index),
        defaultOutfitItem(),
        ...outfitItems.slice(index + 1),
      ]);
      return;
    }

    let item = props.previousItems.filter(
      (item) => item.id == e.target.value
    )[0];

    setOutfitItems([
      ...outfitItems.slice(0, index),
      item,
      ...outfitItems.slice(index + 1),
    ]);
  };

  const handleAddItem = (e: any) => {
    e.preventDefault();
    setOutfitItems([...outfitItems, defaultOutfitItem()]);
  };

  const handleRemoveItem = (e: any, index: number) => {
    e.preventDefault();

    var arr = [...outfitItems];
    arr.splice(index, 1);
    setOutfitItems(arr);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    let filtered = filterEmptyItems(outfitItems);
    let tags = cleanStyleTags(styleTags);
    setMissingFields(false);

    if (
      !imageURL ||
      !validateForm(imageURL, outfitCaption, styleTags, filtered)
    ) {
      setMissingFields(true);
      return;
    }

    let outfitId = getOutfitId(imageURL);
    let outfit: Outfit = {
      id: outfitId,
      title: outfitCaption,
      picture_url: imageURL,
      picture_url_resized: "",
      style_tags: tags,
      items: filtered,
      private: privateMode,
      date: "",
      user_id: "",
      username: "",
      description: "",
    };

    props.onSubmit(outfit);
  };

  useEffect(() => {
    async function upload(formData: any) {
      const resp = await PostImageWithAI(
        props.imageServer,
        formData,
        props.cookie
      );
      if (resp instanceof Error) {
        setFileError(resp.message);
        return;
      }

      setImageURL(resp.url);
      let aiItems = resp.items.map((aiItem, index) => {
        let i = defaultOutfitItem();
        i.description = aiItem.Description;
        i.color_hex = aiItem.ColorHex;
        i.color = ntc.name(aiItem.ColorHex)[3];
        i.color_name = ntc.name(aiItem.ColorHex)[1];
        i.id = `ai-${index}`;
        return i;
      });

      if (aiItems.length > 0) {
        aiItems.push(defaultOutfitItem());
        setOutfitItems([...aiItems]);
      }
      setIsLoading(false);
    }

    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      setIsLoading(true);
      upload(formData);
    }
  }, [props.cookie, file]);

  return (
    <form className="">
      {imageURL ? (
        <div className="flex flex-wrap gap-4">
          <img
            alt={"outfit image to post"}
            src={URL.createObjectURL(file as File)}
            className="object-cover"
            style={{ height: "600px" }}
          />
          <button
            onClick={(e) => {
              e.preventDefault();
              setFile(null);
              setImageURL("");
              setOutfitItems([defaultOutfitItem()]);
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
            Choose an image
          </label>
          {isLoading ? (
            <LoadingGIF />
          ) : (
            <>
              <input
                className="w-full"
                id="file"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
              <label className="requiredLabel">Required*</label>
            </>
          )}
        </>
      )}
      <div className="my-4">
        <label className="" htmlFor="caption">
          Set to Private Post
        </label>

        <Toggle
          checked={privateMode}
          onChange={() => setPrivateMode(!privateMode)}
          label="Private"
        />
      </div>

      <div className="my-4">
        <label className="" htmlFor="caption">
          Outfit Caption
        </label>
        <input
          className="w-full"
          id="caption"
          type="text"
          placeholder="Caption"
          value={outfitCaption}
          onChange={handleFormInput}
        ></input>
        <label className="requiredLabel">Required*</label>
      </div>

      <div className="my-4">
        <label>
          Select as many tags from the options below or enter your own. Start
          tags with &apos;#&apos;
        </label>
        <input
          className="w-full"
          id="tags"
          type="text"
          placeholder="Ex. #athleisure #loungewear"
          value={styleTags}
          onChange={handleFormInput}
        ></input>
        <label className="requiredLabel">Required*</label>
      </div>

      {isLoading ? (
        <LoadingGIF />
      ) : (
        <div className="mb-4">
          <h5>Outfit Items</h5>
          <label>
            Describe and rate the items that appear in your outfit. At least one
            outfit item is required.
          </label>
          <ul>
            {outfitItems.map((item, index) => {
              let displayCount = index + 1;
              let key = displayCount;
              return (
                <li
                  className="shadow border-b-2 border-custom-tan  my-4 rounded-lg p-4"
                  key={key}
                >
                  <div className="flex items-start justify-between">
                    <h5 className="font-bold">Item #{displayCount}.</h5>
                    <XButton onClick={(e: any) => handleRemoveItem(e, index)} />
                  </div>

                  <OutfitItemForm
                    previousOutfitItems={props.previousItems}
                    item={item}
                    index={index}
                    handleItemChange={handleItemChange}
                    handlePreviousItemSelect={handlePreviousItemSelect}
                    handleColorPick={handleColorPick}
                    showForm={item.id.includes("ai-")}
                  />
                </li>
              );
            })}
          </ul>
          <button onClick={handleAddItem} className="primaryButton float-right">
            add item
          </button>
        </div>
      )}

      {missingFields && (
        <div className="mt-8 text-red-500 font-semibold">
          Form is missing required fields.
        </div>
      )}

      <button
        className="bg-gradient hover:scale-105 font-bold py-2 px-4 rounded  w-full mt-8"
        onClick={handleSubmit}
      >
        Submit
      </button>
    </form>
  );
};

function defaultOutfitItem(): OutfitItem {
  return {
    id: "",
    brand: "",
    description: "",
    size: "",
    price: "",
    review: "",
    rating: 2.5,
    link: "",
    color: "",
    store: "",
  };
}

function updateItem(item: OutfitItem, field: string, value: string) {
  switch (field) {
    case "description":
      item.description = value;
      break;
    case "rating":
      item.rating = Number(value);
      break;
    case "review":
      item.review = value;
      break;
    case "link":
      item.link = value;
      break;
    case "price":
      item.price = value;
      break;
    case "size":
      item.size = value;
      break;
    case "brand":
      item.brand = value;
      break;
    case "store":
      item.store = value;
      break;
  }

  return item;
}

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

function filterEmptyItems(items: OutfitItem[]) {
  return items.filter((item) => {
    let empty = !item.description && !item.brand && !item.review;

    if (!empty) {
      // reset ai id
      if (item.id.includes("ai-")) {
        item.id = "";
      }
      return item;
    }
  });
}

function cleanStyleTags(styleTags: string) {
  let tags = styleTags.split(" ");
  tags.forEach((tag, index) => {
    if (tag == "" || tag == " ") {
      tags.splice(index, 1);
      return;
    }

    if (!tag.startsWith("#")) {
      tags[index] = "#" + tag;
    }
  });

  return tags;
}

function getOutfitId(imageURL: string) {
  /// !!!! TODO make image URL env variable
  let outfitId =
    process.env.NODE_ENV == "development"
      ? imageURL?.replace(
          "https://storage.googleapis.com/rateyourstyle-dev/imgs/outfits/",
          ""
        )
      : imageURL?.replace(
          "https://storage.googleapis.com/rateyourstyle/imgs/outfits/",
          ""
        );
  outfitId = outfitId.split("/")[1];
  outfitId = outfitId.split(".")[0];

  return outfitId;
}
