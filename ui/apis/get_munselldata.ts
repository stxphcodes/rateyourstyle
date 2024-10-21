import { data as munselldata } from "../public/munsell-data.json";

export type MunsellData = {
  file_order: number;
  h: string;
  V: number;
  C: number;
  dR: number;
  dG: number;
  dB: number;
};

export const MunsellColors: MunsellData[] = munselldata;

export type MunsellHueData = {
  h: string;
  order: number;
  data?: MunsellData;
};

export function getHighestValue(hue: string) {
  let highestValue: MunsellData = {
    file_order: 0,
    h: "",
    V: 0,
    C: 0,
    dR: 0,
    dG: 0,
    dB: 0,
  };

  munselldata
    .filter((d) => d.h === hue)
    .forEach((d) => {
      if (d.V >= highestValue.C) {
        highestValue = d;
      }
    });

  return highestValue;
}

export function getHighestChroma(hue: string) {
  let highestChroma: MunsellData = {
    file_order: 0,
    h: "",
    V: 0,
    C: 0,
    dR: 0,
    dG: 0,
    dB: 0,
  };

  munselldata
    .filter((d) => d.h === hue)
    .forEach((d) => {
      if (d.C >= highestChroma.C) {
        highestChroma = d;
      }
    });

  return highestChroma;
}

export const getMunsellHues = () => {
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

export function getRandomMunsellData() {
  const max = munselldata.length - 1;
  const randomInt = Math.floor(Math.random() * max);
  return munselldata[randomInt];
}

export function getAdjacentMunsellColor(color: MunsellData) {}

export function calcMunsellData(hue: number, value: number, chroma: number) {
  const hueString = getMunsellHues()[hue];
  const match = munselldata.filter(
    (data) => data.h === hueString && data.V === value && data.C === chroma
  );

  if (match.length > 0) {
    return match[0];
  }
  return null;
}

export function groupColors(colors: MunsellData[]) {
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

  for (let i = 0; i < maxValue; i++) {
    var temp: MunsellData[] = [];
    colors.forEach((c) => {
      if (i == c.V) {
        temp.push(c);
      }
    });

    groups.push(temp);
  }

  groups.forEach((g, i) =>
    groups[i].sort((a, b) => {
      if (a.V > b.V) {
        return -1;
      }
      return 1;
    })
  );

  return groups;
}

export const MunsellHueData = getMunsellHueData();
