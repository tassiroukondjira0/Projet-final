import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

type TrafficByLocationProps = {
    isDark: boolean;
    chartData: {
        labels: string[];
        values: number[];
    };
};

export default function TrafficByLocation({ isDark, chartData }: TrafficByLocationProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        if (!canvasRef.current) {
            return;
        }

        const chart = new Chart(canvasRef.current, {
            type: "doughnut",
            data: {
                labels: chartData.labels,
                datasets: [
                    {
                        data: chartData.values,
                        backgroundColor: ["#4F46E5", "#A5B4FC", "#818CF8", "#E0E7FF"],
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
            },
        });

        return () => chart.destroy();
    }, [chartData, isDark]);

    return (
        <div className="mt-4 rounded-2xl p-4 shadow-sm dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-bold dark:text-white">Traffic by Location</h2>
            <div className="h-[300px]">
                <canvas ref={canvasRef} />
            </div>
        </div>
    );
}
