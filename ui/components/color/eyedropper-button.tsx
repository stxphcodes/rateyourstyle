import { EyedropperIcon } from "../icons/eyedropper";
import { ntc } from "./ntc";

export const EyedropperButton = (props: { onClick: any; colorPicked: any }) => (
  <div
    onClick={props.onClick}
    className="text-xs border-2 border-black rounded-lg flex justify-center  text-center"
  >
    <div className="bg-white p-1 rounded-lg">
      <EyedropperIcon />
    </div>

    {props.colorPicked.hex && (
      <div
        className="w-full"
        style={{ backgroundColor: props.colorPicked.hex }}
      >
        <span className="bg-white opacity-50">
          {ntc.name(props.colorPicked.hex)[1]} {"("}
          {ntc.name(props.colorPicked.hex)[3]}
          {")"} {props.colorPicked.hex}
        </span>
      </div>
    )}
  </div>
);
