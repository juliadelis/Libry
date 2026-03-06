import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
} from "recharts";

import "./index.scss";

const rawData = [
  { month: "Jan", value: 1 },
  { month: "Feb", value: 0 },
  { month: "Mar", value: 0 },
  { month: "Apr", value: 0 },
  { month: "May", value: 0 },
  { month: "Jun", value: 0 },
  { month: "Jul", value: 0 },
  { month: "Ago", value: 0 },
  { month: "Sep", value: 0 },
  { month: "Oct", value: 0 },
  { month: "Nov", value: 0 },
  { month: "Dec", value: 0 },
];

export default function ReadsByMonthGraph() {
  const data = rawData.map((d) => ({
    ...d,
    plotValue: d.value === 0 ? 0.03 : d.value,
  }));

  return (
    <div className="reads-card">
      <h3 className="font-family-koh text-[18px]  text-white text-left mb-4">
        Reads by month
      </h3>

      <div className="reads-top-values">
        {rawData.map((d) => (
          <span key={d.month}>{d.value}</span>
        ))}
      </div>

      <div className="reads-chart-wrap">
        <ResponsiveContainer width="100%" height={145}>
          <BarChart data={data} barCategoryGap="28%">
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#E8EEDC", fontSize: 12 }}
            />
            <YAxis hide domain={[0, 1.1]} />
            <Bar dataKey="plotValue" radius={[8, 8, 8, 8]} barSize={7}>
              {data.map((d) => (
                <Cell
                  key={d.month}
                  fill={d.value === 0 ? "#95A85E" : "#8EAF57"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
