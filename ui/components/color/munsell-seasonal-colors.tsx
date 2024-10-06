import { DualSlider, Slider } from "../base/slider";
import { useState, useEffect } from "react";
import {
  MunsellColors,
  MunsellData,
  MunsellHues,
  MunsellSeasonalData,
} from "../../apis/get_munsell";

function groupColors(colors: MunsellData[]) {
  var groups: MunsellData[][] = [];
  var maxChroma = 1;
  var maxValue = 1;
  colors.forEach((c) => {
    if (c.C >= maxChroma) {
      maxChroma = c.C;
    }

    if (c.V >= maxValue) {
      maxValue = c.V;
    }
  });

  for (let i = 0; i < maxChroma; i++) {
    var temp: MunsellData[] = [];
    colors.forEach((c) => {
      if (i === c.C) {
        temp.push(c);
      }
    });

    groups.push(temp);
  }

  groups.forEach((g, i) =>
    groups[i].sort((a, b) => {
      if (a < b) {
        return -1;
      }
      return 1;
    })
  );

  return groups;
}

export const MunsellSeasonalColors = (props: { season: string }) => {
  let data = MunsellSeasonalData.filter((d) => props.season === d.season)[0];
  let value1 = data.value1;
  let value2 = data.value2;
  let chroma1 = data.chroma1;
  let chroma2 = data.chroma2;
  let hues = data.hues;

  //   switch (props.season) {
  //     case "dark-winter":
  //       value1 = 1;
  //       value2 = 5;
  //       chroma1 = 14;
  //       chroma2 = 28;

  //       //hues = ["2.5R", "5R", "7.5", "10R", "5B", "10B", ];
  //       break;
  //     case "bright-winter":
  //       value1 = 5;
  //       value2 = 10;
  //       chroma1 = 14;
  //       chroma2 = 28;
  //       break;
  //     case "dark-autumn":
  //       value1 = 1;
  //       value2 = 6;
  //       chroma1 = 4;
  //       chroma2 = 14;
  //       hues = ["5R", "5YR", "2.5YR", "7.5Y", "5GY"];
  //   }

  let colors = [...MunsellColors];
  colors = colors.filter((c) => c.V >= value1 && c.V <= value2);
  colors = colors.filter((c) => c.C >= chroma1 && c.C <= chroma2);

  let hueGroups: MunsellData[][][] = [];
  hues.forEach((hue) => {
    let temp = [...colors.filter((c) => c.h === hue)];
    if (temp.length > 1) {
      let colorGroups = groupColors(temp);
      hueGroups.push(colorGroups);
    }
  });

  return (
    <>
      <div className="flex flex-wrap">
        {hueGroups.map((colorGroups) => (
          <>
            {colorGroups.map((g) => (
              <>
                {g.map((c) => {
                  let rgb = `rgb(${c.dR.toString()},${c.dG.toString()},${c.dB.toString()})`;
                  return (
                    <div
                      style={{ backgroundColor: rgb }}
                      className=" w-8 aspect-square"
                    ></div>
                  );
                })}
              </>
            ))}
          </>
        ))}
      </div>
      {/* <div className="flex w-full flex-wrap">
        {hueGroups.map((colorGroups) => (
          <div className="flex  flex-wrap flex-col">
            {colorGroups.map((g) => {
              return (
                <div className="flex">
                  {g.map((c) => {
                    let rgb = `rgb(${c.dR.toString()},${c.dG.toString()},${c.dB.toString()})`;

                    return (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          //   props.setColorSelected(rgb);
                        }}
                        style={{ backgroundColor: rgb }}
                        className=" w-8 aspect-square"
                      ></button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div> */}
    </>
  );
};
