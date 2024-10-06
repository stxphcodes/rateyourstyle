import { DualSlider, Slider } from "../base/slider";
import { useState, useEffect } from "react";
import {
  MunsellColors,
  MunsellData,
  MunsellHues,
} from "../../apis/get_munsell";

function groupColors(colors: MunsellData[]) {
  var groups: MunsellData[][] = [];
  var maxChroma = 0;
  var maxValue = 0;
  colors.forEach((c) => {
    if (c.C > maxChroma) {
      maxChroma = c.C;
    }

    if (c.V > maxValue) {
      maxValue = c.V;
    }
  });

  for (let i = 0; i < maxChroma; i++) {
    var temp: MunsellData[] = [];
    colors.forEach((c) => {
      if (i == c.C) {
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

export const MunsellColorChart = (props: { setColorSelected: any }) => {
  const [value1, setValue1] = useState(0);
  const [value2, setValue2] = useState(10);
  const [chroma1, setChroma1] = useState(0);
  const [chroma2, setChroma2] = useState(28);
  const [hue, setHue] = useState(1);

  const [colors, setColors] = useState(MunsellColors);
  const [colorGroups, setColorGroups] = useState<MunsellData[][]>([]);

  useEffect(() => {
    let copy = [...MunsellColors];
    if (value1 > value2) {
      copy = copy.filter((c) => c.V <= value1 && c.V >= value2);
    } else {
      copy = copy.filter((c) => c.V >= value1 && c.V <= value2);
    }

    if (chroma1 > chroma2) {
      copy = copy.filter((c) => c.C <= chroma1 && c.C >= chroma2);
    } else {
      copy = copy.filter((c) => c.C >= chroma1 && c.C <= chroma2);
    }

    let index = MunsellHues.findIndex((h) => h.order === hue);

    copy = copy.filter((c) => c.h === MunsellHues[index].h);

    setColors(copy);
    setColorGroups(groupColors(copy));
  }, [value1, value2, chroma1, chroma2, hue]);

  return (
    <>
      <DualSlider
        label="Value"
        value1={value1}
        value2={value2}
        onChange1={(e: any) => setValue1(Number(e.target.value))}
        onChange2={(e: any) => setValue2(Number(e.target.value))}
        min={0}
        max={12}
      />

      <DualSlider
        label="Chroma"
        value1={chroma1}
        value2={chroma2}
        onChange1={(e: any) => setChroma1(Number(e.target.value))}
        onChange2={(e: any) => setChroma2(Number(e.target.value))}
        min={0}
        max={28}
      />

      <Slider
        label="Hue"
        value={hue}
        onChange={(e: any) => setHue(Number(e.target.value))}
        min={1}
        max={40}
      />

      <div className="flex w-full flex-wrap flex-col">
        {colorGroups.map((g) => {
          return (
            <div className="flex">
              {g.map((c) => {
                let rgb = `rgb(${c.dR.toString()},${c.dG.toString()},${c.dB.toString()})`;

                return (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      props.setColorSelected(rgb);
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
    </>
  );
};
