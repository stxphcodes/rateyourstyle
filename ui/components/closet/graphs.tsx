import { ClosetCostChart } from "../data-viz/pie-donut";
import { ItemPricesChart } from "../data-viz/box-and-whisker";
import { ItemCostPerWear } from "../data-viz/pie";
import { OutfitItem } from "../../apis/get_outfits";
import { BarGraph } from "../data-viz/bar";

export function ClosetGraphs(props: {
  itemsSelected: string[];
  items: OutfitItem[];
  outfitItemToIds: Map<string, string[]>;
}) {
  return (
    <>
      {props.itemsSelected &&
      props.itemsSelected.length == props.items.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 items-center">
          <ClosetCostChart items={props.items} />
          <ItemPricesChart items={props.items} />
          <BarGraph
            items={props.items}
            itemsToOutfits={props.outfitItemToIds}
          />
        </div>
      ) : // TODO: Make outfit items selected the actual object and store as state.
      props.itemsSelected && props.itemsSelected.length > 1 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 items-center">
          <ClosetCostChart
            items={props.items.filter((item) => {
              let idx = props.itemsSelected.findIndex((i) => i === item.id);
              return idx >= 0;
            })}
          />
          <ItemPricesChart
            items={props.items.filter((item) => {
              let idx = props.itemsSelected.findIndex((i) => i === item.id);
              return idx >= 0;
            })}
          />
        </div>
      ) : (
        props.itemsSelected &&
        props.itemsSelected.length > 0 && (
          <ItemCostPerWear
            item={
              props.items.filter((item) => {
                let idx = props.itemsSelected.findIndex((i) => i === item.id);
                return idx >= 0;
              })[0]
            }
            count={
              props.outfitItemToIds.get(props.itemsSelected[0])
                ? props.outfitItemToIds.get(props.itemsSelected[0])?.length
                : 1
            }
          />
        )
      )}
    </>
  );
}
