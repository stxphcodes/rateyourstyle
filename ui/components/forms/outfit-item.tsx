import { useState } from "react";

import { HexColorPicker } from "react-colorful";
import { OutfitItem } from "../../apis/get_outfits";
import { EyedropperIcon } from "../../components/icons/eyedropper";
import { ntc } from "../../components/color/ntc";

export const OutfitItemForm = (props: {
  item: OutfitItem;
  index: number;
  handleItemChange: any;
  previousOutfitItems: OutfitItem[];
  handlePreviousItemSelect: any;
  handleColorPick: any;
  showForm: boolean;
}) => {
  const [createNewItem, setCreateNewItem] = useState(props.showForm);

  const [showColorPicker, setShowColorPicker] = useState(false);

  const [showOptionalFields, setShowOptionalFields] = useState(false);

  const [color, setColor] = useState(props.item.color_hex || "#000000");

  if (
    props.previousOutfitItems &&
    props.previousOutfitItems.length > 0 &&
    !createNewItem
  ) {
    return (
      <div>
        <div className="flex flex-wrap">
          <div className="mr-2">Select previous clothing item</div>

          <select
            onChange={(e) => props.handlePreviousItemSelect(e, props.index)}
            className="border-2 overflow-x-scroll max-w-full capitalize"
          >
            <option value="">--Please select an item--</option>
            {props.previousOutfitItems.map((item) => (
              <option value={item.id} key={item.id}>
                {item.brand} {item.description}
              </option>
            ))}
          </select>
        </div>

        <div>
          or{" "}
          <button
            className="text-primary underline"
            onClick={(e) => {
              e.preventDefault();
              setCreateNewItem(true);
            }}
          >
            create new item
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-1">
          <div className="md:flex md:gap-4 items-end">
            {/* <div className="md:basis-1/4">
              <label>Item Color?</label>
              <p className="text-xs">Select from image</p>
              <EyeDropper
                colorsPassThrough="colorPicked"
                onChange={({ rgb, hex }: OnChangeEyedrop) => {
                  return props.handleColorPick(props.index, rgb, hex);
                }}
                cursorActive="pointer"
                cursorInactive="default"
                customComponent={EyedropperButton}
              />
              <label className="requiredLabel">Required*</label>
            </div>
              */}

            <div className="md:basis-1/4">
              <label>Item Color?</label>

              {showColorPicker ? (
                <div className="flex items-center gap-1 ">
                  <HexColorPicker color={color} onChange={setColor} />
                  <button
                    style={{ backgroundColor: color }}
                    className="h-fit p-2 rounded"
                    onClick={() => {
                      props.handleColorPick(props.index, color);
                      setShowColorPicker(false);
                    }}
                  >
                    <span className="bg-white opacity-80 px-1">save</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowColorPicker(true)}
                  className="text-xs border border-black rounded-lg flex justify-center items-stretch text-center w-full"
                  style={{ backgroundColor: color }}
                >
                  <div className="bg-white p-1 rounded-l-lg border border-black ">
                    <EyedropperIcon />
                  </div>
                  <div className="w-full p-1">
                    <span className="bg-white opacity-50">
                      {ntc.name(color)[1]}
                      {"("}
                      {ntc.name(color)[3]}
                      {")"} {color}
                    </span>
                  </div>
                </button>
              )}

              <label className="requiredLabel">Required*</label>
            </div>

            <div>
              <label>Please describe what the item is in a few words.</label>
              <input
                className="w-full"
                id="description"
                type="text"
                placeholder="Description"
                value={props.item.description}
                onChange={(e) => props.handleItemChange(e, props.index)}
              ></input>
              <label htmlFor="" className="requiredLabel">
                Required*
              </label>
            </div>
          </div>

          <label className="mt-2 mb-0">
            What is the item&apos;s brand or designer?
          </label>
          <label htmlFor="" className="-mt-1 italic font-normal leading-tight">
            (Use &quot;Unknown&quot; if brand is unknown.)
          </label>
          <input
            className="w-full"
            id="brand"
            type="text"
            placeholder="Brand"
            value={props.item.brand}
            onChange={(e) => props.handleItemChange(e, props.index)}
          ></input>
          <label htmlFor="" className="requiredLabel">
            Required*
          </label>

          <label className="relative inline-flex items-center cursor-pointer mt-4">
            <input
              type="checkbox"
              checked={showOptionalFields}
              className="sr-only peer"
              value={showOptionalFields.toString()}
              onChange={() => setShowOptionalFields(!showOptionalFields)}
            />
            <div
              className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:primary
                     rounded-full peer  peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"
            ></div>
            <span className="ml-3 text-sm font-medium text-gray-900">
              optional fields
            </span>
          </label>

          {showOptionalFields && (
            <>
              <label className="mt-2 mb-0">
                What store, or where did you purchase the item from?
              </label>
              <label
                htmlFor=""
                className="-mt-1 italic font-normal leading-tight"
              >
                (Leave blank if it&apos;s the same as the brand name.)
              </label>
              <input
                className="w-full"
                id="store"
                type="text"
                placeholder="Store"
                value={props.item.store}
                onChange={(e) => props.handleItemChange(e, props.index)}
              ></input>

              <label className="mt-2">Link to the item</label>
              <input
                className="w-full mb-2"
                id="link"
                type="text"
                placeholder="Link"
                value={props.item.link}
                onChange={(e) => props.handleItemChange(e, props.index)}
              ></input>

              <div className="flex gap-4">
                <div>
                  <label>Item Size</label>
                  <input
                    className="w-full"
                    id="size"
                    type="text"
                    placeholder="Size"
                    value={props.item.size}
                    onChange={(e) => props.handleItemChange(e, props.index)}
                  ></input>
                </div>

                <div>
                  <label>Purchase Price</label>
                  <input
                    className="w-full"
                    id="price"
                    type="text"
                    placeholder="Price"
                    value={props.item.price}
                    onChange={(e) => props.handleItemChange(e, props.index)}
                  ></input>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="col-span-1">
          <div className="flex gap-4 items-center">
            <div className="w-fit">
              <label>Your rating</label>
              <input
                id="rating"
                type="range"
                min="1"
                max="5"
                step="0.5"
                className="h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer  p-0 m-0"
                onChange={(e) => props.handleItemChange(e, props.index)}
                list="rating"
                value={props.item.rating}
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
            <h1 className="text-primary">{props.item.rating}</h1>
          </div>

          <label className="mt-2">Your Review</label>
          <textarea
            rows={4}
            className="w-full"
            id="review"
            placeholder="Review"
            onChange={(e) => props.handleItemChange(e, props.index)}
            value={props.item.review}
          ></textarea>
          <label className="requiredLabel">Required*</label>
        </div>
      </div>
    </>
  );
};
