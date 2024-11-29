import { useState } from "react";

import "react-image-crop/dist/ReactCrop.css";

import {
  getAutumnColors,
  getSpringColors,
  getSummerColors,
  getWinterColors,
} from "../../apis/get_munselldata";
import { MunsellColorDiv } from "../../components/color/color-div";

export const ColorAnalysisForm = (props: { imageURL: string }) => {
  const springColors = getSpringColors();
  const summerColors = getSummerColors();
  const autumnColors = getAutumnColors();
  const winterColors = getWinterColors();

  const seasons = [
    {
      name: "Spring",
      colors: springColors,
    },

    {
      name: "Summer",
      colors: summerColors,
    },

    {
      name: "Autumn",
      colors: autumnColors,
    },

    {
      name: "Winter",
      colors: winterColors,
    },
  ];

  const [springBorder, setSpringBorder] = useState(
    `rgb(${springColors[0].dR.toString()},${springColors[0].dG.toString()},${springColors[0].dB.toString()})`
  );
  const [summerBorder, setSummerBorder] = useState(
    `rgb(${summerColors[0].dR.toString()},${summerColors[0].dG.toString()},${summerColors[0].dB.toString()})`
  );
  const [autumnBorder, setAutumnBorder] = useState(
    `rgb(${autumnColors[0].dR.toString()},${autumnColors[0].dG.toString()},${autumnColors[0].dB.toString()})`
  );
  const [winterBorder, setWinterBorder] = useState(
    `rgb(${winterColors[0].dR.toString()},${winterColors[0].dG.toString()},${winterColors[0].dB.toString()})`
  );

  const getBorder = (season: string) => {
    switch (season) {
      case "Spring":
        return springBorder;
      case "Summer":
        return summerBorder;
      case "Autumn":
        return autumnBorder;
      case "Winter":
        return winterBorder;
    }
  };

  const getSetBorderColor = (season: string) => {
    switch (season) {
      case "Spring":
        return setSpringBorder;
      case "Summer":
        return setSummerBorder;
      case "Autumn":
        return setAutumnBorder;
      case "Winter":
        return setWinterBorder;
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
        {seasons.map((season) => (
          <div className="flex-none" key={season.name}>
            <div>{season.name}</div>
            <div className="flex w-full flex-wrap ">
              {season.colors.map((color) => (
                <div className="flex" key={color.h}>
                  <MunsellColorDiv
                    color={color}
                    key={color.file_order}
                    setSelectedColor={getSetBorderColor(season.name)}
                  />
                </div>
              ))}
            </div>
            <img
              alt={"headshot"}
              src={props.imageURL}
              className="object-cover"
              style={{
                height: "200px",
                borderRadius: "50%",
                border: `20px solid ${getBorder(season.name)}`,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
