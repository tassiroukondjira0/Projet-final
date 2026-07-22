import Logo from "../assets/ByeWind Avatar.png";
import iconOverview from "../assets/Icon (1).png";
import iconDot from "../assets/Icon (2).png";
import iconCourses from "../assets/Icon (3).png";
import iconUserProfile from "../assets/Icon (5).png";
import iconAccount from "../assets/Icon (6).png";
import iconCorporate from "../assets/Icon (7).png";
import iconSocial from "../assets/ChatsTeardrop.png";
import iconChevron from "../assets/ArrowLineRight-s.png";
import iconBlog from "../assets/Notebook.png";
import { Link, NavLink } from "react-router-dom";
import { readStoredUser, userIsAdmin, userIsCoach } from "../lib/auth";

type MenuItem = {
    label: string;
    icon: string;
    to: string;
    end?: boolean;
};

const favorites: MenuItem[] = [
    { label: "Overview", icon: iconDot, to: "/page-dashboard", end: true },
    { label: "Courses", icon: iconDot, to: "/page-dashboard/courses" },
];

const dashboardItems: MenuItem[] = [
    { label: "Overview", icon: iconOverview, to: "/page-dashboard", end: true },
    { label: "Courses", icon: iconCourses, to: "/page-dashboard/courses" },
    { label: "Bookings", icon: iconCourses, to: "/page-dashboard/bookings" },
];

const pageItems: MenuItem[] = [
    { label: "User Profile", icon: iconUserProfile, to: "/page-dashboard/user-profile" },
    { label: "Account", icon: iconAccount, to: "/page-dashboard/account" },
    { label: "Corporate", icon: iconCorporate, to: "/page-dashboard/corporate" },
    { label: "Blog", icon: iconBlog, to: "/page-dashboard/blog" },
    { label: "Social", icon: iconSocial, to: "/page-dashboard/social" },
];

const adminItems: MenuItem[] = [
    { label: "Clients", icon: iconUserProfile, to: "/page-dashboard/clients" },
    { label: "Coachs par cours", icon: iconCourses, to: "/page-dashboard/course-coaches" },
];


const coachItems: MenuItem[] = [
    { label: "Mes cours", icon: iconCourses, to: "/page-dashboard/my-courses" },
];

function SidebarItem({
    label,
    icon,
    to,
    onSelect,
    end = false,
}: {
    label: string;
    icon: string;
    to: string;
    onSelect: () => void;
    end?: boolean;
}) {
    return (
        <NavLink
            to={to}
            end={end}
            onClick={onSelect}
            className={({ isActive }) =>
                isActive
                    ? "flex h-9 items-center gap-3 rounded-xl bg-[#e9e9ea] px-4 dark:bg-gray-800"
                    : "flex h-9 items-center gap-2.5 rounded-xl px-2 hover:bg-gray-100 dark:hover:bg-gray-900"
            }
        >
            {({ isActive }) => (
                <>
                    {!isActive && <img src={iconChevron} alt="" className="h-4 w-4 shrink-0" />}
                    <img src={icon} alt="" className="h-5 w-5 shrink-0" />
                    <span className="text-[16px]">{label}</span>
                </>
            )}
        </NavLink>
    );
}

type SidebarProps = {
    isOpen: boolean;
    onClose: () => void;
};

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const user = readStoredUser();
    const adminMenuItems = userIsAdmin(user) ? adminItems : [];
    const coachMenuItems = userIsCoach(user) ? coachItems : [];

    return (
        <>
            <button
                type="button"
                aria-label="Fermer le menu"
                onClick={onClose}
                className={`fixed inset-0 z-30 bg-black/40 transition-opacity lg:hidden ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
            />

            <aside
                className={`fixed inset-y-0 left-0 z-40 w-54 overflow-y-auto bg-white px-4 pt-6 text-[#1f1f1f] transition-transform dark:bg-gray-950 dark:text-gray-100 lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
            >
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <img src={Logo} alt="ByeWind avatar" className="h-8 w-8 rounded-full object-cover" />
                        <p className="text-base font-medium">ByeWind</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-200 lg:hidden"
                        aria-label="Fermer"
                    >
                        <span aria-hidden="true">x</span>
                    </button>
                </div>

                <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between px-2 text-[16px] text-[#b9b9ba] dark:text-gray-500">
                        <span>Favorites</span>
                        <span>Recently</span>
                    </div>

                    <div className="space-y-1.5">
                        {favorites.map((item) => (
                            <NavLink
                                key={item.label}
                                to={item.to}
                                end={item.end}
                                onClick={onClose}
                                className={({ isActive }) =>
                                    `flex h-8 items-center gap-3 rounded-xl px-2 ${
                                        isActive ? "bg-[#e9e9ea] dark:bg-gray-800" : "hover:bg-gray-100 dark:hover:bg-gray-900"
                                    }`
                                }
                            >
                                <img src={item.icon} alt="" className="h-4 w-4 shrink-0" />
                                <span className="text-[16px]">{item.label}</span>
                            </NavLink>
                        ))}
                    </div>
                </div>

                <div className="mt-4">
                    <h2 className="mb-2 px-2 text-[16px] text-[#99999b] dark:text-gray-500">Dashboards</h2>
                    <div className="space-y-1.5">
                        {dashboardItems.map((item) => (
                            <SidebarItem
                                key={item.label}
                                label={item.label}
                                icon={item.icon}
                                to={item.to}
                                end={item.end}
                                onSelect={onClose}
                            />
                        ))}
                    </div>
                </div>

                <div className="mt-4">
                    <h2 className="mb-2 px-2 text-[16px] text-[#99999b] dark:text-gray-500">Pages</h2>
                    <div className="space-y-1.5">
                        {pageItems.map((item) => (
                            <SidebarItem
                                key={item.label}
                                label={item.label}
                                icon={item.icon}
                                to={item.to}
                                onSelect={onClose}
                            />
                        ))}
                        {adminMenuItems.map((item) => (
                            <SidebarItem
                                key={item.label}
                                label={item.label}
                                icon={item.icon}
                                to={item.to}
                                onSelect={onClose}
                            />
                        ))}
                        {coachMenuItems.map((item) => (
                            <SidebarItem
                                key={item.label}
                                label={item.label}
                                icon={item.icon}
                                to={item.to}
                                onSelect={onClose}
                            />
                        ))}
                    </div>
                </div>

                <Link
                    to="/"
                    onClick={onClose}
                    className="mt-6 inline-flex items-center rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700"
                >
                    Retour Accueil
                </Link>
            </aside>
        </>
    );
}
