import * as munselldata from "../public/munsell-data.json";

export type MunsellData = {
  file_order: number;
  h: string;
  V: number;
  C: number;
  dR: number;
  dG: number;
  dB: number;
};

export const MunsellColors: MunsellData[] = munselldata.data;

export type MunsellHueData = {
  h: string;
  order: number;
  data?: MunsellData;
};

function getHighestChroma(hue: string) {
  let highestChroma: MunsellData = {
    file_order: 0,
    h: "",
    V: 0,
    C: 0,
    dR: 0,
    dG: 0,
    dB: 0,
  };

  munselldata.data.filter(d => d.h === hue).forEach((d) => {
    if (d.C >= highestChroma.C) {
      highestChroma = d
    }
  })

  return highestChroma;
}

const getMunsellHues = () => {
  const numbers: string[] = ["2.5", "5", "7.5", "10"];
  const letters: string[] = [
    "R",
    "YR",
    "Y",
    "GY",
    "G",
    "BG",
    "B",
    "PB",
    "P",
    "RP",
  ];

  let arr: string[] = [];
  letters.forEach((l) =>
    numbers.forEach((n) => {
      arr.push(n + l);
    })
  );
  return arr;
};

const getMunsellHueData = () => {
  return getMunsellHues().map((h, index) => {
    return {
      h: h,
      order: index,
      data: getHighestChroma(h),
    };
  });
};

export const MunsellHueData = getMunsellHueData();