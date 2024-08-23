import { DualSlider } from "../base/slider";
import { useState, useEffect } from "react";
import { MunsellColors, MunsellData } from "../../apis/get_munsell";

function rgb2hsl(r: any, g: any, b: any) {
  // see https://en.wikipedia.org/wiki/HSL_and_HSV#Formal_derivation
  // convert r,g,b [0,255] range to [0,1]
  (r = r / 255), (g = g / 255), (b = b / 255);
  // get the min and max of r,g,b
  var max = Math.max(r, g, b);
  var min = Math.min(r, g, b);
  // lightness is the average of the largest and smallest color components
  var lum = (max + min) / 2;
  var hue;
  var sat;
  if (max == min) {
    // no saturation
    hue = 0;
    sat = 0;
  } else {
    var c = max - min; // chroma
    // saturation is simply the chroma scaled to fill
    // the interval [0, 1] for every combination of hue and lightness
    sat = c / (1 - Math.abs(2 * lum - 1));
    switch (max) {
      case r:
        // hue = (g - b) / c;
        // hue = ((g - b) / c) % 6;
        // hue = (g - b) / c + (g < b ? 6 : 0);
        break;
      case g:
        hue = (b - r) / c + 2;
        break;
      case b:
        hue = (r - g) / c + 4;
        break;
    }
  }
  hue = Math.round(hue * 60); // °
  sat = Math.round(sat * 100); // %
  lum = Math.round(lum * 100); // %
  return [hue, sat, lum];
}

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

    copy = copy.filter((c) => c.h === "5G");

    copy.sort((a, b) => (a.hue > b.hue ? 1 : -1));

    setColors(copy);
    setColorGroups(groupColors(copy));
  }, [value1, value2, chroma1, chroma2]);

  return (
    <>
      <DualSlider
        label="Value"
        value1={value1}
        value2={value2}
        onChange1={(e: any) => setValue1(Number(e.target.value))}
        onChange2={(e: any) => setValue2(Number(e.target.value))}
        min={0}
        max={10}
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

      <div className="flex w-full flex-wrap">
        {colors.map((c) => {
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

      <h1> grouped</h1>

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
