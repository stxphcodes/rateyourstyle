export const Slider = (props: {
  label: string;
  onChange: any;
  value: any;
  min: number;
  max: number;
  step?: number;
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
          step={props.step ? props.step : 1}
          className="h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer  p-0 m-0 absolute left-0"
          onChange={props.onChange}
          value={props.value}
        />
      </div>
    </div>
  </div>
);
