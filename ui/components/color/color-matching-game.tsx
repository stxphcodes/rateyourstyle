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
import { PrimaryButton } from "../base/buttons/primary";

const results = ["correct!", "incorrect! 1 attempt remaining", "incorrect!"];

const ResultDiv = (props: { result: string }) => {
  if (!props.result) {
    return null;
  }

  let color = "text-red-600";
  if (props.result === results[0]) {
    color = "text-green-600";
  }

  return <div className={color}>{props.result}</div>;
};

export const ColorMatchingGame = () => {
  const [color, setColor] = useState<MunsellData | null>(null);
  const [colorSelected, setColorSelected] = useState<MunsellData | null>(null);
  const [hue, setHue] = useState(1);
  const [value, setValue] = useState(1);
  const [chroma, setChroma] = useState(2);
  const [maxValue, setMaxValue] = useState(10);
  const [maxChroma, setMaxChroma] = useState(22);
  const [count, setCount] = useState(1);

  const [correctCount, setCorrectCount] = useState(0);
  const [result, setResult] = useState("");

  useEffect(() => {
    if (!color) {
      setColor(getRandomMunsellData());
    }

    const calcColor = calcMunsellData(hue, value, chroma);
    setColorSelected(calcColor);
  });

  const onSubmit = () => {
    if (
      color?.h == colorSelected?.h &&
      color?.V == colorSelected?.V &&
      color?.C == colorSelected?.C
    ) {
      setResult(results[0]);
      setCorrectCount(correctCount + 1);
    } else {
      if (result === results[1]) {
        setResult(results[2]);
      } else {
        setResult(results[1]);
      }
    }
  };

  const onNext = () => {
    setCount(count + 1);
    setHue(1);
    setValue(1);
    setChroma(2);
    setColor(getRandomMunsellData());
    setResult("");
  };

  return (
    <>
      <div className="pb-4">
        <h2>Color Matching Game</h2>
        <p>
          Try to match the colors of the 2 squares by adjusting the color
          dimension scales.
        </p>
      </div>
      {count >= 6 ? (
        <div>
          <h3>Your Results</h3>
          <h4>{correctCount} / 5 correct!</h4>
        </div>
      ) : (
        <div className="w-full flex gap-8">
          <div className="w-1/4">
            <h3>{count} / 5</h3>
            <ResultDiv result={result} />
            {result && result !== results[1] && (
              <PrimaryButton fitContent styles="p-4" onClick={onNext}>
                Next
              </PrimaryButton>
            )}
          </div>

          <div>
            <div className="flex gap-4 md:gap-8">
              {color && (
                <div className="">
                  <MunsellColorDiv
                    border
                    large
                    color={color}
                    className="flex-none"
                  />
                  <p>Match me!</p>
                </div>
              )}
              {colorSelected && (
                <div>
                  <MunsellColorDiv border large color={colorSelected} />
                </div>
              )}
            </div>

            <div className="py-4">
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

            <PrimaryButton
              fitContent
              styles="p-4"
              onClick={onSubmit}
              disabled={result && result !== results[1] ? true : false}
            >
              Submit
            </PrimaryButton>
          </div>
        </div>
      )}
    </>
  );
};
