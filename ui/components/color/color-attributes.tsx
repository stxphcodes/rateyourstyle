export const LowHighChroma = () => (
  <>
    <div className="w-8 h-8" style={{ backgroundColor: "#8c7676" }}></div>
    <div className="w-8 h-8" style={{ backgroundColor: "#ad6866" }}></div>
    <div className="w-8 h-8" style={{ backgroundColor: "#d34d51" }}></div>
    <div className="w-8 h-8" style={{ backgroundColor: "#f5033d" }}></div>
  </>
);

export const LowHighValue = () => (
  <>
    <div className="w-8 h-8" style={{ backgroundColor: "#000000" }}></div>
    <div className="w-8 h-8" style={{ backgroundColor: "#494949" }}></div>
    <div className="w-8 h-8" style={{ backgroundColor: "#bebebe" }}></div>
    <div className="w-8 h-8" style={{ backgroundColor: "#ffffff" }}></div>
  </>
);

export const RainbowHues = () => (
  <>
    <div
      className="w-8 h-8"
      style={{ backgroundColor: "rgb(255, 68, 85)" }}
    ></div>
    <div
      className="w-8 h-8"
      style={{ backgroundColor: "rgb(255, 139, 45)" }}
    ></div>
    <div
      className="w-8 h-8"
      style={{ backgroundColor: "rgb(251, 236, 93)" }}
    ></div>
    <div
      className="w-8 h-8"
      style={{ backgroundColor: "rgb(50, 202, 53)" }}
    ></div>
    <div
      className="w-8 h-8"
      style={{ backgroundColor: "rgb(67, 53, 255)" }}
    ></div>
    <div
      className="w-8 h-8"
      style={{ backgroundColor: "rgb(124, 23, 243)" }}
    ></div>
  </>
);

export const ColorAttributes = (props: {
  coolHue?: boolean;
  warmHue?: boolean;
  lowValue?: boolean;
  highValue?: boolean;
  lowChroma?: boolean;
  highChroma?: boolean;
}) => (
  <div className="">
    <div className="mb-4 grid grid-cols-4 items-center">
      <div className="font-bold col-span-1">Hue</div>

      <div className="flex  flex-wrap justify-between col-span-3">
        <div className="basis-full flex justify-between">
          <div className={`${props.coolHue ? "underline font-bold" : ""}`}>
            Cool
          </div>
          <div className={`${props.warmHue ? "underline font-bold" : ""}`}>
            Warm
          </div>
        </div>
        <div
          className="w-8 h-8"
          style={{ backgroundColor: "rgb(67, 53, 255)" }}
        ></div>
        <div
          className="w-8 h-8"
          style={{ backgroundColor: "rgb(67, 53, 255)" }}
        ></div>

        <div
          className="w-8 h-8"
          style={{ backgroundColor: "rgb(251, 236, 93)" }}
        ></div>
        <div
          className="w-8 h-8"
          style={{ backgroundColor: "rgb(251, 236, 93)" }}
        ></div>
      </div>
    </div>
    <div className="mb-4 grid grid-cols-4 items-center">
      <div className="font-bold col-span-1">Value</div>
      <div className="flex flex-wrap justify-between col-span-3">
        <div className="basis-full flex justify-between">
          <div className={`${props.lowValue ? "underline font-bold" : ""}`}>
            Low
          </div>
          <div className={`${props.highValue ? "underline font-bold" : ""}`}>
            High
          </div>
        </div>
        <LowHighValue />
      </div>
    </div>
    <div className="mb-4 grid grid-cols-4 items-center">
      <div className="font-bold col-span-1">Chroma</div>

      <div className="flex flex-wrap justify-between col-span-3">
        <div className="basis-full flex justify-between">
          <div className={`${props.lowChroma ? "underline font-bold" : ""}`}>
            Low
          </div>

          <div className={`${props.highChroma ? "underline font-bold" : ""}`}>
            High
          </div>
        </div>
        <LowHighChroma />
      </div>
    </div>
  </div>
);
