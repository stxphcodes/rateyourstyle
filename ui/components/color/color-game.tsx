import { useEffect, useState } from "react";
import { MunsellColorCharts } from "./color-charts";
import {
  getMunsellHues,
  calcMunsellData,
  getHighestChroma,
  getRandomMunsellData,
  MunsellData,
  getHighestValue,
} from "../../apis/get_munselldata";
import { MunsellColorDiv } from "./color-div";
import { Slider } from "../base/sliders/slider";

export const ColorIdentificationGame = () => {
  const [color, setColor] = useState<MunsellData | null>(null);
  const [colorSelected, setColorSelected] = useState<MunsellData | null>(null);
  const [hue, setHue] = useState(1);
  const [value, setValue] = useState(1);
  const [chroma, setChroma] = useState(2);
  const [maxValue, setMaxValue] = useState(10);
  const [maxChroma, setMaxChroma] = useState(22);

  useEffect(() => {
    const calcColor = calcMunsellData(hue, value, chroma);

    setColorSelected(calcColor);
  });

  useEffect(() => {
    if (!color) {
      setColor(getRandomMunsellData());
    }
    // const hueString = getMunsellHues()[hue];
    // setMaxChroma(getHighestChroma(hueString).C);
    // setMaxValue(getHighestValue(hueString).V);
  }, []);

  return (
    <>
      <div className="flex flex-1 gap-8">
        <div className="w-80">
          <Slider
            label="Hue"
            value={hue}
            onChange={(e: any) => setHue(Number(e.target.value))}
            min={1}
            max={39}
          />
          <Slider
            label="Value"
            value={value}
            onChange={(e: any) => setValue(Number(e.target.value))}
            min={1}
            max={maxValue}
          />
          <Slider
            label="Chroma"
            value={chroma}
            onChange={(e: any) => setChroma(Number(e.target.value))}
            step={2}
            min={2}
            max={maxChroma}
          />
        </div>
        {color && (
          <MunsellColorDiv border large color={color} className="flex-none" />
        )}
        {colorSelected && (
          <MunsellColorDiv border large color={colorSelected} />
        )}
      </div>
      <div>
        <div>this iss selected</div>
        <div>
          {hue} {chroma} {value}
        </div>
        <div>
          {color?.h}
          {color?.V}
          {color?.C}
        </div>
        {colorSelected?.h}
        {colorSelected?.V}
        {colorSelected?.C}
      </div>
    </>
  );
};
