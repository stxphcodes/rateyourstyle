export function Table(props: { children: JSX.Element; width?: string }) {
  return (
    <div
      className={`${
        props.width ? props.width : ""
      } overflow-x-auto shadow-md rounded-lg max-h-table my-4`}
    >
      <table className="w-full text-xs md:text-sm text-left overflow-x-scroll">
        {props.children}
      </table>
    </div>
  );
}

export function TableHead(props: { columns: string[] }) {
  return (
    <thead className="text-xs uppercase bg-custom-tan sticky top-0">
      <tr>
        {props.columns.map((col) => (
          <th scope="col" className="p-2" key={col}>
            {col}
          </th>
        ))}
      </tr>
    </thead>
  );
}
