import GoogleIcon from "../icons/google-logo";

export function GoogleButton(props: { styles?: string; label?: string }) {
  return (
    <button
      className={`flex gap-2 shadow-sm px-4 py-2 items-center justify-center border rounded-lg ${props.styles}`}
    >
      <GoogleIcon />
      {props.label ? props.label : "Google"}
    </button>
  );
}
