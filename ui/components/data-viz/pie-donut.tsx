import ReactEcharts from "echarts-for-react";

import { OutfitItem } from "../../apis/get_outfits";

export function ExtractPrice(str: string) {
    var n = Number(str.replace(/[^0-9\.]+/g, ""));
    if (n) {
        return n
    }

    return -1
}

export function ClosetCostChart(props: { items: OutfitItem[] }) {
    var prices: number[] = []
    props.items.forEach((item) => {
        if (item.price) {
            let price = ExtractPrice(item.price)
            if (price >= 0) {
                prices.push(price)
            }
        }
    })

    var total = prices.reduce((partialSum, a) => partialSum + a, 0);
    var average = total / prices.length
    var data: any[] = [] 

    if (total == average) {
        data = [
            {
                label: {
                    fontFamily: 'custom-serif'
                },
                value: average,
                name: `Total=Average\n(${average})`
            },
        ]

    } else {
        data = 
        [
            {
                label: {
                    fontFamily: 'custom-serif'
                },
                value: average,
                name: `Average\nprice\nper item:\n${average}`
            },
            {
                label: {
                    fontFamily: 'custom-serif'
                },
                value: total,
                name: `Total:\n${total}`
            },
        ]
    }
  


    const option = {
        title: {
            text: 'Items Total',
            left: 'center',
            textStyle: {
                fontFamily: "custom-serif",
            },
        },
        series: [
            {
                type: 'pie',
                itemStyle: {
                    borderColor: '#aa3c16',
                    borderWidth: 2,
                },
                color: [
                    '#b5ada2',
                    '#aa3c16',
                ],
                data: data,
                radius: ['40%', '60%']
            }
        ]
    };



    return (
        <ReactEcharts option={option} />
    )
}