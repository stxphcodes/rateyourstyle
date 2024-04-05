import ReactEcharts from "echarts-for-react";
import { OutfitItem } from "../../apis/get_outfits";

export function BarGraph(props: {
  items: OutfitItem[];
  itemsToOutfits: Map<string, string[]>;
}) {
  var itemCount: any[] = [];
  props.itemsToOutfits.forEach((outfits, itemId) =>
    itemCount.push({
      itemId: itemId,
      count: outfits.length,
    })
  );
  // sort items by descending count
  itemCount.sort(function (a, b) {
    return b.count - a.count;
  });

  // get top 3 most worn items
  var mostWorn = itemCount.slice(0, 3);

  mostWorn.forEach((itemCount, index) => {
    let item = props.items.filter((item) => itemCount.itemId == item.id)[0];
    mostWorn[index].item = item;
  });

  const option = {
    title: [
      {
        text: "Top 3 most worn items",
        left: "center",
        textStyle: {
          fontSize: 14,
        },
      },
    ],
    yAxis: {
      type: "category",
      data: mostWorn.map((obj) => obj.item.description),
      show: false,
    },
    xAxis: {
      type: "value",
      splitNumber: 2,
    },
    series: [
      {
        data: mostWorn.map((obj) => obj.count),
        type: "bar",
        label: {
          show: true,
          formatter: "{b}: {c}",
          position: "inside",
          fontSize: "10px",
          overflow: "break",
        },
        color: ["#e6cfab"],
      },
    ],
  };

  return <ReactEcharts option={option} />;
}
