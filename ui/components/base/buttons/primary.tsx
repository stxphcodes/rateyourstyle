export function PrimaryButton(props: {
  children: JSX.Element | string;
  disabled?: boolean;
  isSubmit?: boolean;
  onClick?: any;
  styles?: string;
  fitContent?: boolean;
}) {
  return (
    <button
      className={`${props.disabled ? "bg-neutral-700" : "bg-black"} py-2 ${
        props.fitContent ? "fit-content" : "w-full"
      } rounded-lg shadow border text-white hover:bg-neutral-700 ${
        props.disabled ? "hover:cursor-not-allowed" : "hover:cursor-pointer"
      } ${props.styles && props.styles}`}
      type={props.isSubmit ? "submit" : "button"}
      disabled={props.disabled}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
}
