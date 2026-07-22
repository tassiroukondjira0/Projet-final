import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import StatsCards from "../Components/StatsCards.tsx";
import TotalUsers from "../Components/Total_Users.tsx";
import TrafficByDevices from "../Components/TraficByDevices.tsx";
import TrafficByLocation from "../Components/TrafficByLocation.tsx";
import vec from "../assets/Icon.svg";
import fle from "../assets/Vector.svg";
import { getDashboardOverview } from "../lib/api";
import type { DashboardOverview } from "../lib/api";
import { readStoredToken } from "../lib/auth";
import type { DashboardOutletContext } from "./Page";

const defaultOverview: DashboardOverview = {
    stats: [
        { id: "views", title: "Views", value: 7232, change: "+11.2%", trend: "up" },
        { id: "visits", title: "Visits", value: 3537, change: "+2.2%", trend: "up" },
        { id: "newUsers", title: "New Users", value: 396, change: "+3.7%", trend: "up" },
        { id: "activeUsers", title: "Active Users", value: 1232, change: "+4.3%", trend: "up" },
    ],
    totalUsers: {
        labels: ["Jan", "Fev", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        thisYear: [43000, 10000, 43200, 34940, 34039, 30420, 21109, 29393, 22943, 39309, 95765, 3594],
        lastYear: [53440, 33340, 52340, 38393, 48385, 38572, 22594, 99284, 93348, 23942, 34928, 34953],
    },
    trafficByDevice: {
        labels: ["Linux", "Mac", "iOS", "Windows", "Android", "Other"],
        values: [41000, 10040, 24200, 20324, 60953, 32452],
    },
    trafficByLocation: {
        labels: ["Senegal", "Guinee", "Gambie", "Other"],
        values: [42, 23, 14, 21],
    },
};

const formatNumber = (value: number) => new Intl.NumberFormat("fr-FR").format(value);

export default function Overview() {
    const { isDark } = useOutletContext<DashboardOutletContext>();
    const [data, setData] = useState<DashboardOverview>(defaultOverview);
    const [error, setError] = useState("");

    useEffect(() => {
        let isMounted = true;

        const loadOverview = async () => {
            try {
                const token = readStoredToken();

                if (!token) {
                    throw new Error("Session manquante.");
                }

                const response = await getDashboardOverview(token);
                if (isMounted) {
                    setData(response);
                    setError("");
                }
            } catch {
                if (isMounted) {
                    setError("Impossible de charger les donnees API. Affichage des donnees locales.");
                }
            }
        };

        void loadOverview();

        return () => {
            isMounted = false;
        };
    }, []);

    const cardIcons = useMemo(() => [vec, fle, vec, vec], []);
    const cardColors = useMemo(() => ["bg-blue-100", "bg-purple-100", "bg-orange-100", "bg-red-100"], []);

    return (
        <div className="min-h-screen bg-white px-4 pb-6 pt-20 dark:bg-gray-950 sm:px-6 lg:ml-54 lg:pt-21">
            <div>
                <h2 className="font-bold text-black dark:text-white">Overview</h2>
                {error ? (
                    <p className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                        {error}
                    </p>
                ) : null}
                <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {data.stats.map((stat, index) => (
                        <StatsCards
                            key={stat.id}
                            title={stat.title}
                            value={formatNumber(stat.value)}
                            color={cardColors[index % cardColors.length]}
                            percent={stat.change}
                            icon={cardIcons[index % cardIcons.length]}
                        />
                    ))}
                </div>
            </div>
            <TotalUsers isDark={isDark} chartData={data.totalUsers} />
            <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
                <TrafficByDevices isDark={isDark} chartData={data.trafficByDevice} />
                <TrafficByLocation isDark={isDark} chartData={data.trafficByLocation} />
            </div>
        </div>
    );
}
