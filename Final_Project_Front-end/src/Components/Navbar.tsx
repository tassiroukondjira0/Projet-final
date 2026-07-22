import button from '../assets/Button.png'
import Favorite from '../assets/Button (1).png'
import Story from '../assets/Button (2).png'
import Notif from '../assets/Button (3).png'
import icon from '../assets/Icon.png'
import { Link } from 'react-router-dom'

type NavbarProps = {
    onToggle: () => void
    isDark: boolean
    isSidebarOpen: boolean
    onOpenSidebar: () => void
}

function Navbar({ onToggle, isDark, isSidebarOpen, onOpenSidebar }: NavbarProps) {
    return (
        <header className="top-0 left-0 right-0 z-20 lg:left-54">
            <div className="flex h-16 items-center justify-between rounded-b-2xl bg-white px-4 shadow-xl dark:bg-gray-900 dark:text-gray-100 sm:px-6">
                <div className="flex min-w-0 items-center gap-2 sm:gap-4">
                    <button
                        type="button"
                        onClick={onOpenSidebar}
                        className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 transition hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800 lg:hidden"
                        aria-label="Ouvrir le menu"
                        aria-expanded={isSidebarOpen}
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
                            <path d="M3 6h18M3 12h18M3 18h18" />
                        </svg>
                    </button>

                    <div className="hidden items-center gap-1 sm:flex">
                        <button
                            type="button"
                            className="flex h-9 w-9 items-center justify-center rounded-md transition hover:bg-white/70 dark:hover:bg-gray-900"
                            aria-label="Panneau"
                            title="Panneau"
                        >
                            <img src={icon} alt="Panneau" className="h-4 w-5 dark:invert" />
                        </button>
                        <button
                            type="button"
                            className="flex h-9 w-9 items-center justify-center rounded-md transition hover:bg-white/70 dark:hover:bg-gray-900"
                            aria-label="Favoris"
                            title="Favoris"
                        >
                            <img src={Favorite} alt="Favoris" className="h-5 w-5 dark:invert" />
                        </button>
                    </div>

                    <div className="hidden items-center gap-3 text-sm md:flex lg:text-base">
                        <span className="text-[#9a9a9d] dark:text-gray-400">Dashboards</span>
                        <span className="text-[#cbcbce] dark:text-gray-500">/</span>
                        <span className="text-[#1f1f1f] dark:text-gray-100">Default</span>
                    </div>
                </div>

                <div className="hidden items-center gap-1 rounded-xl bg-[#ececec] px-3 py-2 dark:bg-gray-900 md:flex">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-4 w-4 text-gray-400 dark:text-gray-500"
                        aria-hidden="true"
                    >
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <input
                        className="w-24 bg-transparent text-[15px] text-gray-500 placeholder:text-gray-400 outline-none dark:text-gray-100 dark:placeholder:text-gray-500"
                        placeholder="Search"
                        type="text"
                        name="search"
                        id="search"
                    />
                    <span className="flex h-5 w-5 items-center justify-center rounded-sm border border-gray-300 text-[11px] leading-none text-gray-300 dark:border-gray-600 dark:text-gray-500">
                        /
                    </span>
                </div>

                <div className="flex shrink-0 items-center gap-0.5">
                    <button
                        type="button"
                        onClick={onToggle}
                        className="flex h-9 w-9 items-center justify-center rounded-md transition hover:bg-gray-200 dark:hover:bg-gray-800"
                        aria-label={isDark ? "Désactiver le mode sombre" : "Activer le mode sombre"}
                        title={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
                    >
                        <img src={button} alt="Theme" className="h-8 w-8 dark:invert" />
                    </button>
                    <button
                        type="button"
                        className="hidden h-9 w-9 items-center justify-center rounded-md transition hover:bg-gray-200 dark:hover:bg-gray-800 sm:flex"
                        aria-label="Historique"
                        title="Historique"
                    >
                        <img src={Story} alt="Historique" className="h-8 w-8 dark:invert" />
                    </button>
                    <button
                        type="button"
                        className="hidden h-9 w-9 items-center justify-center rounded-md transition hover:bg-gray-200 dark:hover:bg-gray-800 sm:flex"
                        aria-label="Notifications"
                        title="Notifications"
                    >
                        <img src={Notif} alt="Notifications" className="h-8 w-8 dark:invert" />
                    </button>
                    <Link
                        to="/"
                        className="flex h-9 w-9 items-center justify-center rounded-md transition hover:bg-gray-200 dark:hover:bg-gray-800"
                        aria-label="Accueil"
                        title="Accueil"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="black"
                            className="h-5 w-4 dark:invert"
                            aria-hidden="true"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                            />
                        </svg>
                    </Link>
                </div>
            </div>
        </header>
    );
}

export default Navbar;
