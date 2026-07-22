import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

type TrafficByDevicesProps = {
    isDark: boolean;
    chartData: {
        labels: string[];
        values: number[];
    };
};

export default function TrafficByDevices({ isDark, chartData }: TrafficByDevicesProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        if (!canvasRef.current) {
            return;
        }

        const chart = new Chart(canvasRef.current, {
            type: "bar",
            data: {
                labels: chartData.labels,
                datasets: [
                    {
                        label: "Traffic",
                        data: chartData.values,
                        backgroundColor: ["#4F46E5", "#A5B4FC", "#818CF8", "#6366F1", "#38BDF8", "#34D399"],
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: isDark ? "#fff" : "#000",
                        },
                    },
                },
                scales: {
                    x: { ticks: { color: isDark ? "#fff" : "#000" } },
                    y: { ticks: { color: isDark ? "#fff" : "#000" } },
                },
            },
        });

        return () => chart.destroy();
    }, [chartData, isDark]);

    return (
        <div className="mt-4 rounded-2xl p-4 shadow-sm dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-bold dark:text-white">Traffic by Device</h2>
            <div className="h-[300px]">
                <canvas ref={canvasRef} />
            </div>
        </div>
    );
}
