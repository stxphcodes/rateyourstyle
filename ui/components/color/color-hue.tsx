import { MunsellHueData } from "../../apis/get_munselldata";
export const MunsellHueCircle = (props: { setHue: any }) => {
  return (
    <div className="p-4">
      <ul
        style={{
          width: "250px",
          height: "250px",
          borderRadius: "50%",
          position: "relative",
          //padding: "2em",
          //margin: "0 auto",
          listStyle: "none",
        }}
      >
        {MunsellHueData.map(
          (hue, index) =>
            hue.data.h && (
              <button
                style={{
                  background: `rgb(${hue.data.dR.toString()},${hue.data.dG.toString()},${hue.data.dB.toString()})`,
                  top: "50%",
                  left: "50%",
                  position: "absolute",
                  margin: "5px",
                  display: "block",
                  transform: `rotate(${
                    9 * index
                  }deg) translate(125px) rotate(-${9 * index}deg) `,
                  padding: "10px",
                  borderRadius: "50%",
                }}
                onClick={(e) => {
                  e.preventDefault();
                  props.setHue(hue.data.h);
                }}
              ></button>
            )
        )}
      </ul>
    </div>
  );
};
