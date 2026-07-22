import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

type TotalUsersProps = {
    isDark: boolean;
    chartData: {
        labels: string[];
        thisYear: number[];
        lastYear: number[];
    };
};

export default function TotalUsers({ isDark, chartData }: TotalUsersProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        if (!canvasRef.current) {
            return;
        }

        const chart = new Chart(canvasRef.current, {
            type: "line",
            data: {
                labels: chartData.labels,
                datasets: [
                    {
                        label: "This Year",
                        data: chartData.thisYear,
                        borderColor: "#4F46E5",
                        backgroundColor: "rgba(79, 70, 229, 0.15)",
                        tension: 0.25,
                    },
                    {
                        label: "Last Year",
                        data: chartData.lastYear,
                        borderColor: "#A5B4FC",
                        backgroundColor: "rgba(165, 180, 252, 0.15)",
                        tension: 0.25,
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
            <h2 className="mb-4 text-lg font-bold dark:text-white">Total Users</h2>
            <div className="h-[300px]">
                <canvas ref={canvasRef} />
            </div>
        </div>
    );
}
