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

export const ColorDifferenceGame = () => {
  const [color1, setColor1] = useState<MunsellData | null>(null);
  const [color2, setColor2] = useState<MunsellData | null>(null);

  const [count, setCount] = useState(1);

  const [correctCount, setCorrectCount] = useState(0);
  const [result, setResult] = useState("");

  useEffect(() => {
    if (!color1) {
      setColor1(getRandomMunsellData());
    }
  }, []);

  useEffect(() => {}, [color1]);

  const onSubmit = () => {};

  const onNext = () => {
    setCount(count + 1);

    setColor1(getRandomMunsellData());

    setResult("");
  };

  return (
    <>
      <div className="pb-4">
        <h2>Color Difference Game</h2>
        <p>
          Which dimension of color is different between the 2 color blocks? Try
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
              {color1 && (
                <MunsellColorDiv
                  border
                  large
                  color={color1}
                  className="flex-none"
                />
              )}
              {color2 && (
                <MunsellColorDiv
                  border
                  large
                  color={color2}
                  className="flex-none"
                />
              )}
            </div>

            <div className="py-4"></div>

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
