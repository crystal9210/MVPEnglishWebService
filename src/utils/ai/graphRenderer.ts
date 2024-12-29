import { ChartJSNodeCanvas } from "chartjs-node-canvas";

export async function generateGraphBuffer(
  labels: string[],
  data: number[]
): Promise<Buffer> {
  const canvas = new ChartJSNodeCanvas({ width: 600, height: 400 });
  const config = {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Performance",
          data,
          backgroundColor: "rgba(75,192,192,0.6)",
        },
      ],
    },
  };
  return await canvas.renderToBuffer(config);
}
