export const DualSlider = (props: {
  label: string;
  onChange1: any;
  onChange2: any;
  value1: any;
  value2: any;
  min: number;
  max: number;
}) => (
  <div className="flex gap-4 items-center mb-4">
    <div className="w-fit">
      <label>{props.label}</label>
      <div className="relative dual-slider">
        <input
          id="dual-slider"
          type="range"
          min={props.min}
          max={props.max}
          step="1"
          className="h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer  p-0 m-0 absolute left-0"
          onChange={props.onChange1}
          value={props.value1}
        />
        <input
          id="dual-slider"
          type="range"
          min={props.min}
          max={props.max}
          step="1"
          className="h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer  p-0 m-0 absolute left-0"
          onChange={props.onChange2}
          value={props.value2}
        />
      </div>
    </div>
  </div>
);

export const Slider = (props: {
  label: string;
  onChange: any;
  value: any;
  min: number;
  max: number;
}) => (
  <div className="flex gap-4 items-center mb-4">
    <div className="w-fit">
      <label>{props.label}</label>
      <div className="relative">
        <input
          id=""
          type="range"
          min={props.min}
          max={props.max}
          step="1"
          className="h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer  p-0 m-0 absolute left-0"
          onChange={props.onChange}
          value={props.value}
        />
      </div>
    </div>
  </div>
);
