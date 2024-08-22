import {
  TrueWinterPalette,
  ColorCode,
  DarkAutumnPalette,
  TrueAutumnPalette,
  SoftAutumnPalette,
  TrueSummerPalette,
  TrueSpringPalette,
} from "../../apis/get_colorpalette";

export const ColorPalette = (props: { palette: string }) => {
  let colors: ColorCode[] = [];
  switch (props.palette) {
    case "true-autumn":
      colors = TrueAutumnPalette;
      break;
    case "true-summer":
      colors = TrueSummerPalette;
      break;
    case "true-spring":
      colors = TrueSpringPalette;
      break;
    case "true-winter":
      colors = TrueWinterPalette;
  }
  return (
    <div className="flex w-full">
      {colors.map((c) => (
        <div
          style={{ backgroundColor: c.rgb ? c.rgb : c.hex }}
          className="border-2 flex-1 aspect-square"
        ></div>
      ))}
    </div>
  );
};
