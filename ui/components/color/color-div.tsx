import { MunsellData } from "../../apis/get_munselldata";

export function ColorDiv(props: {
  color: string;
  hex?: string;
  name?: string;
}) {
  return (
    <div className="flex gap-2 items-center">
      {props.hex && (
        <div
          className="w-5 h-5 rounded"
          style={{ backgroundColor: props.hex }}
        ></div>
      )}
      <div>
        {props.name ? `${props.name} (${props.color})` : props.color}{" "}
        {props.hex}
      </div>
    </div>
  );
}

export const ColorDivRGB = (props: { r: number; g: number; b: number }) => {
  let rgb = `rgb(${props.r.toString()},${props.g.toString()},${props.b.toString()})`;
  return <div style={{ backgroundColor: rgb }} className="w-8 aspect-square" />;
};

export const MunsellColorDiv = (props: {
  color: MunsellData;
  border?: boolean;
  large?: boolean;
  className?: string;
  singleLine?: boolean;
}) => {
  let rgb = `rgb(${props.color.dR.toString()},${props.color.dG.toString()},${props.color.dB.toString()})`;
  return (
    <div
      style={{ backgroundColor: rgb }}
      className={`${props.className && props.className} aspect-square ${
        props.large ? "w-16" : "w-8"
      } ${props.border ? "border-2 border-black" : ""} ${
        props.singleLine ? "flex-1" : ""
      }`}
    />
  );
};
