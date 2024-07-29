export function PrimaryButton(props: {
  children: JSX.Element | string;
  disabled?: boolean;
  isSubmit?: boolean;
  onClick?: any;
}) {
  return (
    <button
      className="bg-black py-2 w-full rounded-lg shadow border text-white hover:bg-neutral-700 hover:cursor-pointer"
      type={props.isSubmit ? "submit" : "button"}
      disabled={props.disabled}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
}
