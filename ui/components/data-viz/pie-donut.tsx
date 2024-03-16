import ReactEcharts from "echarts-for-react";

import { OutfitItem } from "../../apis/get_outfits";

export function ExtractPrice(str: string) {
  var n = Number(str.replace(/[^0-9\.]+/g, ""));
  if (n) {
    return n;
  }

  return -1;
}

export function ClosetCostChart(props: { items: OutfitItem[] }) {
  var prices: number[] = [];
  props.items.forEach((item) => {
    if (item.price) {
      let price = ExtractPrice(item.price);
      if (price >= 0) {
        prices.push(price);
      }
    }
  });

  var total = prices.reduce((partialSum, a) => partialSum + a, 0);
  var average = Math.round((total / prices.length) * 100) / 100;
  var data: any[] = [];

  if (total == average) {
    data = [
      {
        value: average,
        name: `Total=Average\n(${average})`,
      },
    ];
  } else {
    data = [
      {
        value: average,
        name: `Average\nprice\nper item:\n${average}`,
      },
      {
        value: total,
        name: `Total:\n${total}`,
      },
    ];
  }

  const option = {
    title: {
      text: "Items Total",
      left: "center",
      textStyle: {
        fontSize: 14,
      },
    },
    series: [
      {
        type: "pie",
        itemStyle: {
          borderColor: "#e6cfab",
          borderWidth: 2,
        },
        color: ["#b5ada2", "#e6cfab"],
        data: data,
        radius: ["40%", "60%"],
      },
    ],
  };

  return <ReactEcharts option={option} />;
}
