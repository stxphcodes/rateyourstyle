export const Slider = (props: {
  label: string;
  onChange1: any;
  onChange2: any;
  value1: any;
  value2: any;
}) => (
  <div className="flex gap-4 items-center">
    <div className="w-fit">
      <label>{props.label}</label>
      <input
        id="rating"
        type="range"
        min="0"
        max="4"
        step="1"
        className="h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer  p-0 m-0"
        onChange={props.onChange1}
        list="rating"
        value={props.value1}
      />
      <input
        id="rating"
        type="range"
        min="4"
        max="8"
        step="1"
        className="h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer  p-0 m-0"
        onChange={props.onChange2}
        list="rating"
        value={props.value2}
      />
      <datalist
        className="flex text-primary -mt-2 p-0 justify-between items-start"
        id="rating"
      >
        {/* <option className="text-xs">|</option>
      <option className="text-xs">|</option>
      <option className="text-xs">|</option>
      <option className="text-xs">|</option>
      <option className="text-xs">|</option> */}
      </datalist>
    </div>
  </div>
);
