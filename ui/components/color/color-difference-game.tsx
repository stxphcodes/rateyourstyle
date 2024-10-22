import { useEffect, useState } from "react";
import {
  getMunsellHues,
  calcMunsellData,
  getHighestChroma,
  getRandomMunsellData,
  MunsellData,
  getHighestValue,
  getAdjacentMunsellColor,
} from "../../apis/get_munselldata";
import { MunsellColorDiv } from "./color-div";
import { Slider } from "../base/sliders/slider";
import { PrimaryButton } from "../base/buttons/primary";

const results = ["correct!", "incorrect"];

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
  const [colorDiff, setColorDiff] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);

  const [count, setCount] = useState(1);

  const [correctCount, setCorrectCount] = useState(0);
  const [result, setResult] = useState("");

  useEffect(() => {
    if (!color1) {
      setColor1(getRandomMunsellData());
    }
  }, []);

  useEffect(() => {
    if (color1) {
      const adjColor = getAdjacentMunsellColor(color1);
      setColor2(adjColor.color);
      setColorDiff(adjColor.difference);
    }
  }, [color1]);

  const onSubmit = () => {
    if ((colorDiff === 0 || colorDiff === 1) && selected === 0) {
      setResult("correct!");
      setCorrectCount(correctCount + 1);
      return;
    }

    if (colorDiff === selected) {
      setResult("correct!");
      setCorrectCount(correctCount + 1);
      return;
    }

    setResult("incorrect");
  };

  const onNext = () => {
    setCount(count + 1);
    setColor1(getRandomMunsellData());
    setSelected(null);
    setResult("");
  };

  return (
    <>
      <div className="pb-4">
        <h2>Color Difference Game</h2>
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
            {result && (
              <PrimaryButton fitContent styles="p-4" onClick={onNext}>
                Next
              </PrimaryButton>
            )}
          </div>

          <div>
            <p>
              How does color block R differ from color block L? <br />
              Only 1 color dimension is different, the other 2 dimensions are
              equal.
            </p>
            <div className="flex gap-4 md:gap-8">
              {color1 && (
                <div>
                  <h2>L</h2>
                  <MunsellColorDiv
                    border
                    large
                    color={color1}
                    className="flex-none"
                  />
                </div>
              )}
              {color2 && (
                <div>
                  <h2>R</h2>
                  <MunsellColorDiv
                    border
                    large
                    color={color2}
                    className="flex-none"
                  />
                </div>
              )}
            </div>

            <div className="py-4">
              <div className="flex gap-2 my-2">
                <input
                  type="radio"
                  name=""
                  value={0}
                  checked={selected === 0}
                  onChange={() => setSelected(0)}
                />
                <label>The hue between R and L are different. </label>
              </div>
              <div className="flex gap-2 my-2">
                <input
                  type="radio"
                  name=""
                  value={2}
                  checked={selected === 2}
                  onChange={() => setSelected(2)}
                />
                <label>
                  R is more muted than L.
                  <br />
                  <span style={{ fontWeight: 400 }}>
                    (R.Chroma &lt; L.Chroma)
                  </span>
                </label>
              </div>
              <div className="flex gap-2 my-2">
                <input
                  type="radio"
                  name=""
                  value={3}
                  checked={selected === 3}
                  onChange={() => setSelected(3)}
                />
                <label>
                  R is more saturated than L. <br />
                  <span style={{ fontWeight: 400 }}>
                    (R.Chroma &gt; L.Chroma)
                  </span>
                </label>
              </div>
              <div className="flex gap-2 my-2">
                <input
                  type="radio"
                  name=""
                  value={4}
                  checked={selected === 4}
                  onChange={() => setSelected(4)}
                />
                <label>
                  R is darker than L. <br />
                  <span style={{ fontWeight: 400 }}>
                    (R.Value &lt; L.Value)
                  </span>
                </label>
              </div>
              <div className="flex gap-2 my-2">
                <input
                  type="radio"
                  name=""
                  value={5}
                  checked={selected === 5}
                  onChange={() => setSelected(5)}
                />
                <label>
                  R is lighter than L .
                  <br />{" "}
                  <span style={{ fontWeight: 400 }}>
                    (R.Value &gt; L.Value)
                  </span>
                </label>
              </div>
            </div>

            <PrimaryButton
              fitContent
              styles="p-4"
              onClick={onSubmit}
              disabled={result !== ""}
            >
              Submit
            </PrimaryButton>
          </div>
        </div>
      )}
    </>
  );
};
