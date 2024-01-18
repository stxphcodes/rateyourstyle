import ReactEcharts from "echarts-for-react";

import { OutfitItem } from "../apis/get_outfits";

function extractPrice(str: string) {
    var n = Number(str.replace(/[^0-9\.]+/g, ""));
    if (n) {
        return n
    }

    return -1
}

export function Budget(props: { items: OutfitItem[] }) {
    var prices: number[] = []
    props.items.forEach((item) => {
        if (item.price) {
            let price = extractPrice(item.price)
            if (price >= 0) {
                prices.push(price)
            }
        }
    })

    var total = prices.reduce((partialSum, a) => partialSum + a, 0);
    var average = total / prices.length


    prices = prices.sort(function (a, b) { return a - b; });



    // const pieoption = {
    //     title: [
    //       {
    //         text: 'Closet Costs',
    //         left: 'center',
    //         top: 0
    //       }
    //     ],
    //     polar: {
    //       radius: [30, '80%']
    //     },
    //     angleAxis: {
    //       max: total,
    //       startAngle: 90,
    //       splitLine: {
    //         show: false
    //       },
    //       axisTick: {
    //         show: false
    //       },
    //       axisLabel: {
    //         show: false
    //       },
    //       show: false,
    //     },
    //     radiusAxis: {
    //       type: 'category',
    //       data: ['Average', 'Total'],
    //         show: false,

    //     },
    //     tooltip: {},
    //     series: {
    //       type: 'bar',
    //       name: "",
    //       data: [{value: average, name: "avg" }, {value: total, name: "total" } ],
    //     //   data: [  average, total],
    //       coordinateSystem: 'polar',
    //        color: [
    //                   '#aa3c16'
    //               ],
    //               labelLine: {
    //                 show: false,
    //               }
    //     }
    //   };

    
    const pieoption = {
        title: {
            text: "Black Mesh Top Cost Per Wear\ntotal price:",
            //text: 'Closet Total',
            left: 'center',
            //top: 'center'
        },
        series: [
            {
                type: 'pie',
                itemStyle: {
                    borderColor: '#aa3c16',
                    borderWidth: 2,
                    borderCap: 'round'
                  
                },
                color: [
                    '#b5ada2',
                    '#aa3c16',
                    //'#aa3c16',
                    
                ],
                data: [

                     
                    {
                        value: average,
                        name: `Cost per wear\n(${average})`
                    },
              
                     
                    {
                        value: average,
                        name: `Cost per wear\n(${average})`
                    },
                    {
                        value: average,
                        name: `Cost per wear\n(${average})`
                    },
                    {
                        value: average,
                        name: `Cost per wear\n(${average})`
                    },
                    // {
                    //     value: average,
                    //     name: `Average price per item\n(${average})`
                    // },
                    // {
                    //     value: total,
                    //     name: `Total\n(${total})`
                    // },
                ],
                radius: ['00%', '60%']
            }
        ]
    };

    const option = {
        title: [
            {
                text: 'Item Prices',
                left: 'center',
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
                            return 'closet'
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
            }
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
                //     encode: {

                //   tooltip: [1, 3,  5]
                // },
                tooltip: {
                    show: true,
                    position: ['0%', '20%'],
                    textStyle: { fontSize: 14 },
                    formatter: function (params: any) {
                        return `50% of your clothes cost between ${params.data[2]} and ${params.data[4]}. <br />` +
                            `Median price: ${params.data[3]}.`
                    }
                }
            }
        ]
    };

    return (
        <>
        <div className="grid grid-cols-1 sm:grid-cols-2">
            <div>
            <ReactEcharts option={pieoption} />
            
            </div>
            <div>
            <ReactEcharts option={option} />
            </div>

        </div>
        </>





    )


}