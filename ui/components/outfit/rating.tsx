export function RatingDiv(props: { x: number; small?: boolean }) {
  return (
    <div style={{ fontSize: props.small ? "16px" : "30px" }}>
      {props.x == 0 ? "" : props.x}
    </div>
  );
}
