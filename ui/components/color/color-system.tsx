import { DualSlider } from "../base/sliders/dualSlider";
import { Slider } from "../base/sliders/slider";
import { useState, useEffect } from "react";
import {
  MunsellColors,
  MunsellData,
  MunsellHueData,
  //MunsellHues,
} from "../../apis/get_munselldata";
import { MunsellHueCircle } from "./color-hue";
import { ColorDiv, ColorDivRGB, MunsellColorDiv } from "./color-div";
import { groupColors } from "../../apis/get_munselldata";

export const MunsellColorSystem = () => {
  const [value1, setValue1] = useState(0);
  const [value2, setValue2] = useState(10);
  const [chroma1, setChroma1] = useState(0);
  const [chroma2, setChroma2] = useState(28);
  const [hue, setHue] = useState("2.5R");
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

    let index = MunsellHueData.findIndex((h) => h.h === hue);

    copy = copy.filter((c) => c.h === MunsellHueData[index].h);
    setColorGroups(groupColors(copy));
  }, [value1, value2, chroma1, chroma2, hue]);

  return (
    <div className="flex gap-4 flex-wrap">
      <MunsellHueCircle setHue={setHue} />

      {/* <Slider
        label="Hue"
        value={hue}
        onChange={(e: any) => setHue(Number(e.target.value))}
        min={1}
        max={40}
      /> */}

      <div className="col-span-2 flex gap-2">
        <DualSlider
          label="Value"
          value1={value1}
          value2={value2}
          onChange1={(e: any) => setValue1(Number(e.target.value))}
          onChange2={(e: any) => setValue2(Number(e.target.value))}
          min={0}
          max={12}
          vertical
        />

        <div>
          <div className="flex w-full flex-wrap flex-col">
            {colorGroups.map((g) => {
              return (
                <div className="flex">
                  {g.map((c) => (
                    <MunsellColorDiv color={c} />
                  ))}
                </div>
              );
            })}
          </div>
          <div>
            <DualSlider
              label="Chroma"
              value1={chroma1}
              value2={chroma2}
              onChange1={(e: any) => setChroma1(Number(e.target.value))}
              onChange2={(e: any) => setChroma2(Number(e.target.value))}
              min={0}
              max={28}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
