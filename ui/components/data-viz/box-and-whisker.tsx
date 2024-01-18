import ReactEcharts from "echarts-for-react";

import { OutfitItem } from "../../apis/get_outfits";
import { ExtractPrice } from "./pie-donut";


export function ItemPricesChart(props: { items: OutfitItem[] }) {

    var prices: number[] = []
    props.items.forEach((item) => {
        if (item.price) {
            let price = ExtractPrice(item.price)
            if (price >= 0) {
                prices.push(price)
            }
        }
    })
    prices = prices.sort(function (a, b) { return a - b; });

    if (prices.length < 5) {
        return <h6 className="text-background-2">
            Please select 5 or more items *with prices* in the closet table to render this plot.</h6>
    }

    const option = {
        title: [
            {
                text: 'Item Prices',
                left: 'center',
                textStyle: {
                    fontFamily: "custom-serif",
                },
                subtext: '(click or hover over the plot to read description)'
            },
        ],
        dataset: [
            {
                source: [
                    [...prices]
                ]
            },
            {
                transform: {
                    type: 'boxplot',
                    config: {
                        itemNameFormatter: function (params: any) {
                            return 'item costs'
                        }
                    }
                }
            },
            {
                fromDatasetIndex: 1,
                fromTransformResult: 1
            }
        ],
        tooltip: {
            show: true,
            trigger: 'item',
            axisPointer: {
                type: 'shadow'
            },
            textStyle: {
                fontFamily: "custom-serif",
            },
        },
        grid: {
            left: '10%',
            right: '10%',
            top: '20%',
        },
        yAxis: {
            type: 'category',
            boundaryGap: false,
            splitArea: {
                show: false
            },
            splitLine: {
                show: false
            },
            show: false,
        },
        xAxis: {
            type: 'value',
            splitArea: {
                show: false
            },
            min: prices[0],
            max: prices[prices.length - 1]
        },
        series: [
            {
                name: 'boxplot',
                type: 'boxplot',
                datasetIndex: 1,
                itemStyle: {
                    borderColor: '#b5ada2',
                    color: '#aa3c16',
                    borderWidth: 4

                },
                tooltip: {
                    show: true,
                    position: ['0%', '20%'],
                    textStyle: { fontSize: 14 },
                    formatter: function (params: any) {
                        return `50% of the clothes cost between ${params.data[2]} and ${params.data[4]}. <br />` +
                            `Median price: ${params.data[3]}.`
                    }
                }
            }
        ]
    };

    return (
        <ReactEcharts option={option} />
    )
}