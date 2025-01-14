import ReactEcharts from "echarts-for-react";

import { OutfitItem } from "../../apis/get_outfits";
import { ExtractPrice } from "./pie-donut";

// Function to calculate quartiles
function getQuartile(sortedNumbers: number[], percentile: number) {
  const index = Math.floor((sortedNumbers.length - 1) * percentile);
  const lowerValue = sortedNumbers[Math.floor(index)];
  const upperValue = sortedNumbers[Math.ceil(index)];
  return lowerValue + (upperValue - lowerValue) * (index % 1);
}

function getBoxWhiskerDataPoints(sortedNumbers: number[]) {
  // Calculate quartiles
  const q1 = getQuartile(sortedNumbers, 0.25);
  const median = getQuartile(sortedNumbers, 0.5);
  const q3 = getQuartile(sortedNumbers, 0.75);

  // Calculate interquartile range (IQR)
  const iqr = q3 - q1;

  // Calculate minimum and maximum within 1.5 * IQR from Q1 and Q3
  const min = q1 - 1.5 * iqr;
  const max = q3 + 1.5 * iqr;

  // Return the box and whisker data points
  return [min, q1, median, q3, max];
}

export function ItemPricesChart(props: { items: OutfitItem[] }) {
  var prices: number[] = [];
  props.items.forEach((item) => {
    if (item.price) {
      let price = ExtractPrice(item.price);
      if (price >= 0) {
        prices.push(price);
      }
    }
  });
  prices = prices.sort(function (a, b) {
    return a - b;
  });

  if (prices.length < 5) {
    return (
      <h6 className="text-background-2">
        Please select 5 or more items *with prices* in the closet table to
        render this plot.
      </h6>
    );
  }

  var dataPoints = getBoxWhiskerDataPoints(prices);
  var calculatedMax = dataPoints[4];
  var greaterThanMaxIndex = -1;
  var max = prices[prices.length - 1];

  for (let i = 0; i < prices.length; i++) {
    if (prices[i] > calculatedMax) {
      greaterThanMaxIndex = i;
      break;
    }
  }

  if (greaterThanMaxIndex > 0) {
    max = prices[greaterThanMaxIndex];
  }

  const option = {
    title: [
      {
        text: "Item Prices",
        left: "center",
        textStyle: {
          fontSize: 14,
        },
        subtext: "(click or hover over the plot to read description)",
      },
    ],
    dataset: [
      {
        source: [[...prices]],
      },
      {
        transform: {
          type: "boxplot",
          config: {
            itemNameFormatter: function (params: any) {
              return "item costs";
            },
          },
        },
      },
      {
        fromDatasetIndex: 1,
        fromTransformResult: 1,
      },
    ],
    tooltip: {
      show: true,
      trigger: "item",
      axisPointer: {
        type: "shadow",
      },
    },
    grid: {
      left: "10%",
      right: "10%",
      top: "20%",
    },
    yAxis: {
      type: "category",
      boundaryGap: false,
      splitArea: {
        show: false,
      },
      splitLine: {
        show: false,
      },
      show: false,
    },
    xAxis: {
      type: "value",
      splitArea: {
        show: false,
      },
      min: prices[0],
      max: max,
    },
    series: [
      {
        name: "boxplot",
        type: "boxplot",
        datasetIndex: 1,
        itemStyle: {
          borderColor: "#b5ada2",
          color: "#e6cfab",
          borderWidth: 4,
        },
        tooltip: {
          show: true,
          position: ["0%", "20%"],
          textStyle: { fontSize: 14 },
          formatter: function (params: any) {
            return (
              `50% of the clothes cost between ${params.data[2]} and ${params.data[4]}. <br />` +
              `Median price: ${params.data[3]}`
            );
          },
        },
      },
    ],
  };

  return <ReactEcharts option={option} opts={{ renderer: "svg" }} />;
}
