import ReactEcharts from "echarts-for-react";

import { OutfitItem } from "../../apis/get_outfits";

export function ExtractPrice(str: string) {
    var n = Number(str.replace(/[^0-9\.]+/g, ""));
    if (n) {
        return n
    }

    return -1
}

export function ItemCostPerWear(props: { item: OutfitItem, count: number | undefined }) {
    var price = ExtractPrice(props.item.price)
    if (price < 0 || props.count == undefined) {
        return <h6 className="text-background-2 my-4">
        Please select an item *with a price* in the closet table to render the Cost per Wear graph.</h6>
    }

    var cpw = price/props.count

    var data: any[] = []
    for (let i = 0; i < props.count; i++) {
        data.push({
            value: cpw,
            name: `Cost per wear: ${cpw}`
        })
    }
    const option = {
        title: {
            text: `${props.item.description}, price: ${props.item.price}`,
            textStyle: {
                fontFamily: "custom-serif",
                fontSize: "12px"
            },
            left: 'center',

        },
        series: [
            {
                type: 'pie',
                itemStyle: {
                    borderColor:   '#b5ada2',
                    borderWidth: 2,
                },
                color: [

                    '#aa3c16',
                ],
                data: data,
                radius: ['30%', '60%']
            }
        ]
    };

    return (
        <ReactEcharts option={option} />
    )
}