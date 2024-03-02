export function ColorDiv(props: {
  color: string;
  hex?: string;
  name?: string;
}) {
  return (
    <div className="flex gap-2 items-center">
      {props.hex && (
        <div
          className="w-5 h-5 rounded"
          style={{ backgroundColor: props.hex }}
        ></div>
      )}
      <div>
        {props.name ? `${props.name} (${props.color})` : props.color}{" "}
        {props.hex}
      </div>
    </div>
  );
}
