export function Modal(props: {children: JSX.Element; handleClose: any, fullHeight?: boolean, wideScreen?: boolean}) {
	return (
		<>
			<div className="fixed z-50 top-0 w-screen h-screen bg-black bg-opacity-50"></div>
			{/* <!-- Main modal --> */}

			<div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2  z-50 w-full ${props.wideScreen ? "md:w-3/4" : "md:w-1/2"} p-8 bg-white shadow-lg rounded-lg overflow-y-scroll ${props.fullHeight && "h-full"}`}>
				{/* <!-- Modal body --> */}
				<div>
					<XButton onClick={props.handleClose} />
					{props.children}
				</div>
			</div>
		</>
	);
}

export function XButton(props: {onClick: any}) {
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
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
				/>
			</svg>
			<span className="sr-only">Close modal</span>
		</button>
	)

}
