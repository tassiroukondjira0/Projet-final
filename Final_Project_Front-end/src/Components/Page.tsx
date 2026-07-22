import Navbar from "../Components/Navbar.tsx";
import {useEffect, useState} from "react";
import { Outlet } from "react-router-dom";

type PageProps = {
    isSidebarOpen: boolean;
    onOpenSidebar: () => void;
};

export type DashboardOutletContext = {
    isDark: boolean;
};

export default function Page({ isSidebarOpen, onOpenSidebar }: PageProps) {
    const [isDark, setIsDark] = useState(() => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) {
            return savedTheme === "dark";
        }

        return window.matchMedia("(prefers-color-scheme: dark)").matches;
    });

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDark);
        localStorage.setItem("theme", isDark ? "dark" : "light");
    }, [isDark]);

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar
                isDark={isDark}
                isSidebarOpen={isSidebarOpen}
                onOpenSidebar={onOpenSidebar}
                onToggle={() => setIsDark((prev) => !prev)}
            />
            <Outlet context={{ isDark } satisfies DashboardOutletContext} />
        </div>
    );
}
