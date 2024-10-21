export const DualSlider = (props: {
  label: string;
  onChange1: any;
  onChange2: any;
  value1: any;
  value2: any;
  min: number;
  max: number;
  vertical?: boolean;
}) => (
  <div className={`flex gap-4 ${!props.vertical ? "items-center" : ""} mb-4`}>
    <div className="w-fit">
      <label>{props.label}</label>
      <div
        className={`relative dual-slider`}
        style={props.vertical ? { marginLeft: "50%" } : {}}
      >
        <input
          style={
            props.vertical
              ? {
                  writingMode: "vertical-lr",
                  direction: "rtl",
                  verticalAlign: "middle",
                }
              : {}
          }
          id="dual-slider"
          type="range"
          min={props.min}
          max={props.max}
          step="1"
          className={`${
            props.vertical ? "w-1" : "h-1"
          } bg-gray-200 rounded-lg appearance-none cursor-pointer  p-0 m-0 absolute`}
          onChange={props.onChange1}
          value={props.value1}
        />
        <input
          style={
            props.vertical
              ? {
                  writingMode: "vertical-lr",
                  direction: "rtl",
                  verticalAlign: "middle",
                }
              : {}
          }
          id="dual-slider"
          type="range"
          min={props.min}
          max={props.max}
          step="1"
          className={`${
            props.vertical ? "w-1" : "h-1"
          } bg-gray-200 rounded-lg appearance-none cursor-pointer  p-0 m-0 absolute`}
          onChange={props.onChange2}
          value={props.value2}
        />
      </div>
    </div>
  </div>
);
