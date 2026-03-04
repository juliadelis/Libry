import {
  Bar,
  XAxis,
  BarChart,
  usePlotArea,
  Tooltip,
  TooltipIndex,
} from "recharts";
import { RechartsDevtools } from "@recharts/devtools";

export default function ReadGraph() {
  const data = [
    { label: "Jan", value: 0 },
    { label: "Feb", value: 0 },
    { label: "Mar", value: 0 },
    { label: "Apr", value: 0 },
    { label: "May", value: 0 },
    { label: "Jun", value: 0 },
    { label: "Jul", value: 0 },
    { label: "Aug", value: 0 },
    { label: "Sep", value: 0 },
    { label: "Oct", value: 0 },
    { label: "Nov", value: 0 },
    { label: "Dec", value: 0 },
  ];

  return (
    <div className="bg-[#0E2310] rounded-2xl h-full p-4 w-full">
      <BarChart
        style={{
          width: "100%",
          maxWidth: "700px",
          maxHeight: "70vh",
          aspectRatio: 1.618,
        }}
        responsive
        data={data}
        barCategoryGap={4}>
        <XAxis dataKey="label" mirror padding={{ right: 30 }} interval={1} />

        <Bar
          dataKey="value"
          label={{
            fill: "white",
            position: "insideTopRight",
            angle: 0,
            textAnchor: "start",
          }}
        />
        <BottomTooltip />
        <RechartsDevtools />
      </BarChart>
    </div>
  );
}

const BottomTooltip = () => {
  const plotArea = usePlotArea();
  if (plotArea == null) {
    return null;
  }
  return (
    <Tooltip
      defaultIndex={2}
      cursor={false}
      position={{ y: plotArea.y + plotArea.height - 100 }}
    />
  );
};
