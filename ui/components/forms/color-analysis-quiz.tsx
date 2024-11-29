import { useState } from "react";

import "react-image-crop/dist/ReactCrop.css";

import { PrimaryButton } from "../base/buttons/primary";

const seasons: any = [
  {
    name: "Spring",
    pink: "#fe8b83",
    yellow: "#fbeb7f",
    black: "#595250",
    brown: "#ce925b",
    white: "#fefdf5",
    metallic: "#f6d364",
  },

  {
    name: "Summer",
    pink: "#f9ccda",
    yellow: "#fff8ce",
    black: "#3f3e45",
    brown: "#674b42",
    white: "#f4f4fd",
    metallic: "#cfcfcf",
  },

  {
    name: "Autumn",
    pink: "#eb935d",
    yellow: "#deb056",
    black: "#382d25",
    brown: "#895d43",
    white: "#f0e8dd",
    metallic: "#ebb248",
  },

  {
    name: "Winter",
    pink: "#a5224d",
    yellow: "#edeb97",
    black: "#111232",
    brown: "#32180a",
    white: "#ffffff",
    metallic: "#d5d5d5",
  },
];

export const ColorAnalysisQuiz = (props: {
  imageURL: string;
  setAnalysisResults: any;
  setMostLikelySeason: any;
}) => {
  const [questionIndex, setQuestionIndex] = useState(0);

  const [questionAnswers, setQuestionAnswers] = useState([
    {
      question: "brown",
      answer: "",
    },
    {
      question: "yellow",
      answer: "",
    },
    {
      question: "pink",
      answer: "",
    },
    {
      question: "white",
      answer: "",
    },
    {
      question: "black",
      answer: "",
    },
  ]);

  const handleSelection = (e: any, index: number) => {
    let copy = [...questionAnswers];

    let questionAnswer = copy[index];
    questionAnswer.answer = e.target.value;

    copy[index] = questionAnswer;
    setQuestionAnswers(copy);
  };

  const handleNext = (e: any) => {
    e.preventDefault();
    setQuestionIndex(questionIndex + 1);
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();

    let counts: any = {
      Spring: 0,
      Summer: 0,
      Winter: 0,
      Autumn: 0,
    };

    questionAnswers.forEach((answer) => (counts[`${answer.answer}`] += 1));
    props.setAnalysisResults(counts);

    let maxCount = 0;
    Object.keys(counts).forEach((season) => {
      if (counts[season] > maxCount) {
        maxCount = counts[season];
      }
    });

    let seasons: string[] = [];
    Object.keys(counts).map((season) => {
      if (counts[season] === maxCount) {
        seasons.push(season);
      }
    });

    props.setMostLikelySeason(seasons);
  };

  return (
    <div>
      <h2>Of the following color options, which looks best on you?</h2>
      <div>
        When observing the options, try to focus on your face instead of the
        color border surrounding your photo.
        <div className="my-4">
          Choose the option that:
          <ul className="list-disc list-inside">
            <li>Makes your skintone appear even</li>
            <li>Contours/defines your facial features naturally </li>
            <li>Gives your face a lift or natural glow</li>
          </ul>
        </div>
        <div className="my-4">
          Rule out the option that:
          <ul className="list-disc list-inside">
            <li>Makes you appear yellowish or orangeish</li>
            <li>Empahsizes dark cicles</li>
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {seasons.map((season: any) => {
          let key = questionAnswers[questionIndex].question;
          let border = season[`${key}`];
          return (
            <div
              className="flex flex-wrap align-center sm:gap-4 gap-2"
              key={border}
            >
              <input
                type="radio"
                value={season.name}
                onClick={(e: any) => handleSelection(e, questionIndex)}
                checked={questionAnswers[questionIndex].answer === season.name}
              />

              <div
                style={{
                  borderRadius: "50%",
                  border: "0.25px solid black",
                }}
              >
                <img
                  alt={"headshot"}
                  src={props.imageURL}
                  className="object-cover"
                  style={{
                    height: "200px",
                    borderRadius: "50%",
                    border: `25px solid ${border}`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      {questionIndex == questionAnswers.length - 1 ? (
        <PrimaryButton styles="mt-8" onClick={handleSubmit}>
          Submit
        </PrimaryButton>
      ) : (
        <PrimaryButton styles="mt-8" onClick={handleNext}>
          Next
        </PrimaryButton>
      )}
    </div>
  );
};
