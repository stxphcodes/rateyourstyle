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

function getHueNumber(hue: string) {
  return getMunsellHues().findIndex((h) => h === hue);
}

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

export function getAdjacentMunsellColor(color: MunsellData) {
  let rand = Math.floor(Math.random() * 6);
  let toReturn = null;

  switch (rand) {
    // hue lower
    case 0:
      let hueInteger = getHueNumber(color.h);
      if (hueInteger === 0) {
        break;
      }

      let newHue = getMunsellHues()[hueInteger - 1];
      munselldata.forEach((data) => {
        if (data.h === newHue && data.C === color.C && data.V === color.V) {
          toReturn = data;
          return;
        }
      });
      break;

    // hue increase
    case 1:
      hueInteger = getHueNumber(color.h);
      newHue = getMunsellHues()[hueInteger + 1];
      munselldata.forEach((data) => {
        if (data.h === newHue && data.C === color.C && data.V === color.V) {
          toReturn = data;
          return;
        }
      });
      break;

    // chroma lower
    case 2:
      let newChroma = color.C - 1;
      munselldata.forEach((data) => {
        if (color.h === data.h && newChroma === data.C && color.V === data.V) {
          toReturn = data;
          return;
        }
      });
      break;

    // chroma increase
    case 3:
      newChroma = color.C + 1;
      munselldata.forEach((data) => {
        if (color.h === data.h && newChroma === data.C && color.V === data.V) {
          toReturn = data;
          return;
        }
      });
      break;

    // value lower
    case 4:
      let newValue = color.V - 1;
      munselldata.forEach((data) => {
        if (color.h === data.h && color.C === data.C && newValue === data.V) {
          toReturn = data;
          return;
        }
      });
      break;

    // value increase
    case 5:
      newValue = color.V + 1;
      munselldata.forEach((data) => {
        if (color.h === data.h && color.C === data.C && newValue === data.V) {
          toReturn = data;
          return;
        }
      });
      break;
  }

  if (!toReturn) {
    return getAdjacentMunsellColor(color);
  }

  return { color: toReturn, difference: rand };
}

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

export function groupColors(colors: MunsellData[], sortChroma = false) {
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

    temp.sort((a, b) => {
      if (a.V > b.V) {
        return -1;
      }
      return 1;
    });

    groups.push(temp);
  }

  return groups;
}

export const MunsellHueData = getMunsellHueData();

export function getSpringColors() {
  const hues = getMunsellHues();
  const colorsToReturn: MunsellData[] = [];

  hues.forEach((hue) => {
   
    let hueColors = munselldata.filter( 
      (data) =>  data.h === hue  && data.V === 7
    );

    let maxChroma: any = null
    hueColors.forEach(c => {
      if(!maxChroma) {
        maxChroma = c
        return 
      }

      if (c.C > maxChroma.C) {
        maxChroma = c
      }
    })


    colorsToReturn.push(maxChroma);
  });

return colorsToReturn
}

export function getWinterColors() {
  const hues = getMunsellHues();

  const colorsToReturn: MunsellData[] = [];

  hues.forEach((hue) => {
   
    let hueColors = munselldata.filter( 
      (data) =>  data.h === hue  && data.V === 5
    );

    let maxChroma: any = null
    hueColors.forEach(c => {
      if(!maxChroma) {
        maxChroma = c
        return 
      }

      if (c.C > maxChroma.C) {
        maxChroma = c
      }
    })


    colorsToReturn.push(maxChroma);
  });

  return colorsToReturn;
}

export function getSummerColors() {
  const hues = getMunsellHues();

  const colorsToReturn: MunsellData[] = [];

  hues.forEach((hue) => {
    let hueColors = munselldata.filter(
      (data) => data.h === hue && data.V === 8 && data.C === 4
    );

    colorsToReturn.push(...hueColors);
  });

  return colorsToReturn;
}


export function getAutumnColors() {
  const hues = getMunsellHues();

  const colorsToReturn: MunsellData[] = [];

  hues.forEach((hue) => {
    let hueColors = munselldata.filter(
      (data) => data.h === hue && data.V === 4
    );

    let maxChroma: any = null
    hueColors.forEach(c => {
      if(!maxChroma) {
        maxChroma = c
        return 
      }

      if (c.C > maxChroma.C) {
        maxChroma = c
      }
    })

    let filtered = hueColors.filter(c => c.C === maxChroma.C -2)

    colorsToReturn.push(...filtered)
  }
  );
  



  return colorsToReturn;

}
