export function Modal(props: {
  children: JSX.Element;
  handleClose: any;
  fullHeight?: boolean;
  wideScreen?: boolean;
  noPadding?: boolean;
  noBackground?: boolean;
}) {
  return (
    <>
      <div
        className={`fixed top-0 z-50 w-screen h-screen ${
          !props.noBackground && "bg-black bg-opacity-50"
        }`}
      ></div>
      {/* <!-- Main modal --> */}

      <div
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2  z-50 w-full ${
          props.wideScreen ? "md:w-3/4" : "md:w-1/2"
        } ${
          props.noPadding ? "" : "p-4"
        } bg-white shadow-lg rounded overflow-y-scroll ${
          props.fullHeight && "h-full"
        } border-gray border-2`}
      >
        {/* <!-- Modal body --> */}
        <div>
          <XButton onClick={props.handleClose} />
          {props.children}
        </div>
      </div>
    </>
  );
}

export function XButton(props: { onClick: any }) {
  return (
    <button
      type="button"
      className="hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-4 float-right"
      onClick={props.onClick}
    >
      <svg
        className="w-3 h-3"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 14 14"
      >
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
        />
      </svg>
      <span className="sr-only">Close modal</span>
    </button>
  );
}
