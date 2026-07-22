import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import photo from "../assets/pic.jpg";
import {
    clearAuth,
    readStoredToken,
    readStoredUser,
    userCanAccessDashboard,
    userIsAdmin,
} from "../lib/auth";

const navItems = [
    { label: "Accueil", to: "/" },
    { label: "Nos cours", to: "/cours" },
    { label: "A propos", to: "/a-propos" },
];

export default function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [user, setUser] = useState(() => readStoredUser());
    const [token, setToken] = useState(() => readStoredToken());

    useEffect(() => {
        setIsMenuOpen(false);
        setIsProfileMenuOpen(false);
        setUser(readStoredUser());
        setToken(readStoredToken());
    }, [location.pathname, setUser, setToken]);


    const isAuthenticated = useMemo(() => {
        return Boolean(token && user);
    }, [token, user]);

    const openDashboard = () => {
        if (!userCanAccessDashboard(user)) {
            navigate("/login");
            return;
        }

        navigate("/page-dashboard");
    };

    const openProfile = () => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }

        navigate("/page-dashboard/user-profile");
    };

    const handleLogout = () => {
        clearAuth();
        setUser(null);
        setToken(null);
        setIsProfileMenuOpen(false);
        setIsMenuOpen(false);
        navigate("/", { replace: true });
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-30 border-b border-white/15 bg-black/75 text-white backdrop-blur">
            <div className="mx-auto flex h-18 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
                <NavLink to="/" end className="flex items-center text-lg font-bold tracking-wide">
                    <img src={photo} alt="Logo" className="mr-2 inline-block h-10 w-10 rounded-full" />
                    FitClub
                </NavLink>

                <nav aria-label="Navigation principale" className="hidden md:block">
                    <ul className="flex items-center gap-6 text-sm font-medium">
                        {navItems.map((item) => (
                            <li key={item.label}>
                                <NavLink
                                    to={item.to}
                                    end={item.to === "/"}
                                    className={({ isActive }) =>
                                        `transition hover:text-orange-300 ${isActive ? "text-orange-300" : ""}`
                                    }
                                >
                                    {item.label}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="relative hidden items-center gap-3 md:flex">
                    {!isAuthenticated ? (
                        <>
                            <button
                                type="button"
                                className="h-10 rounded-md border border-orange-300 px-4 text-sm font-semibold text-orange-300 transition hover:bg-orange-300 hover:text-black"
                                onClick={() => navigate("/register")}
                            >
                                Inscription
                            </button>
                            <button
                                type="button"
                                className="h-10 rounded-md border border-white/30 px-4 text-sm font-semibold transition hover:border-orange-300 hover:text-orange-300"
                                onClick={() => navigate("/login")}
                            >
                                Connexion
                            </button>
                        </>
                    ) : null}

                    <button
                        type="button"
                        aria-label="Profil"
                        title="Profil"
                        onClick={() => setIsProfileMenuOpen((previous) => !previous)}
                        className="inline-flex h-10 items-center gap-2 rounded-md border border-white/30 px-3 transition hover:border-orange-300 hover:text-orange-300"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="h-5 w-5"
                            aria-hidden="true"
                        >
                            <circle cx="12" cy="8" r="4" />
                            <path d="M4 20c0-3.5 3.5-6 8-6s8 2.5 8 6" />
                        </svg>
                        <span className="max-w-28 truncate text-sm font-medium">
                            {isAuthenticated ? user?.name : "Profil"}
                        </span>
                    </button>

                    {isProfileMenuOpen ? (
                        <div className="absolute right-0 top-13 z-40 w-64 rounded-lg border border-white/20 bg-[#141414] p-3 shadow-xl">
                            {isAuthenticated ? (
                                <>
                                    <p className="px-2 py-1 text-xs text-gray-400">Connecte en tant que</p>
                                    <p className="px-2 pb-2 text-sm font-semibold text-white">{user?.name}</p>
                                    <button
                                        type="button"
                                        onClick={openProfile}
                                        className="w-full rounded-md px-3 py-2 text-left text-sm transition hover:bg-white/10"
                                    >
                                        Mes informations
                                    </button>
                                    <button
                                        type="button"
                                        onClick={openDashboard}
                                        className="mt-1 w-full rounded-md px-3 py-2 text-left text-sm transition hover:bg-white/10"
                                    >
                                        Acceder au dashboard
                                    </button>
                                    {userIsAdmin(user) ? (
                                        <button
                                            type="button"
                                            onClick={() => navigate("/page-dashboard/clients")}
                                            className="mt-1 w-full rounded-md px-3 py-2 text-left text-sm transition hover:bg-white/10"
                                        >
                                            Section clients
                                        </button>
                                    ) : null}
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="mt-2 w-full rounded-md border border-red-300/40 px-3 py-2 text-left text-sm text-red-200 transition hover:bg-red-500/10"
                                    >
                                        Deconnexion
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => navigate("/login")}
                                        className="w-full rounded-md px-3 py-2 text-left text-sm transition hover:bg-white/10"
                                    >
                                        Se connecter
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => navigate("/register")}
                                        className="mt-1 w-full rounded-md px-3 py-2 text-left text-sm transition hover:bg-white/10"
                                    >
                                        Creer un compte
                                    </button>
                                </>
                            )}
                        </div>
                    ) : null}
                </div>

                <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-md border border-white/30 md:hidden"
                    aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                    onClick={() => setIsMenuOpen((previous) => !previous)}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-5 w-5"
                        aria-hidden="true"
                    >
                        {isMenuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
                    </svg>
                </button>
            </div>

            <div className={`border-t border-white/15 px-4 py-4 md:hidden ${isMenuOpen ? "block" : "hidden"}`}>
                <nav aria-label="Navigation mobile">
                    <ul className="space-y-3 text-sm font-medium">
                        {navItems.map((item) => (
                            <li key={item.label}>
                                <NavLink
                                    to={item.to}
                                    end={item.to === "/"}
                                    className={({ isActive }) =>
                                        `block transition hover:text-orange-300 ${isActive ? "text-orange-300" : ""}`
                                    }
                                >
                                    {item.label}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                {!isAuthenticated ? (
                    <div className="mt-4 flex items-center gap-3">
                        <button
                            type="button"
                            className="h-10 rounded-md border border-orange-300 px-4 text-sm font-semibold text-orange-300 transition hover:bg-orange-300 hover:text-black"
                            onClick={() => navigate("/register")}
                        >
                            Inscription
                        </button>
                        <button
                            type="button"
                            className="h-10 rounded-md border border-white/30 px-4 text-sm font-semibold transition hover:border-orange-300 hover:text-orange-300"
                            onClick={() => navigate("/login")}
                        >
                            Connexion
                        </button>
                    </div>
                ) : (
                    <div className="mt-4 space-y-2 text-sm">
                        <p className="text-gray-300">Connecte: {user?.name}</p>
                        <button
                            type="button"
                            onClick={openProfile}
                            className="w-full rounded-md border border-white/20 px-3 py-2 text-left"
                        >
                            Mes informations
                        </button>
                        <button
                            type="button"
                            onClick={openDashboard}
                            className="w-full rounded-md border border-white/20 px-3 py-2 text-left"
                        >
                            Acceder au dashboard
                        </button>
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="w-full rounded-md border border-red-300/40 px-3 py-2 text-left text-red-200"
                        >
                            Deconnexion
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}
