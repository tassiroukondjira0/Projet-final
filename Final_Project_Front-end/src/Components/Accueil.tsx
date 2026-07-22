import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Contenu from "./Contenu";
import { LOGIN_NOTICE_STORAGE_KEY, readStoredUser, userIsAdmin } from "../lib/auth";

type LoginNotice = {
    name: string;
    role: string;
};

const readLoginNotice = (): LoginNotice | null => {
    try {
        const raw = sessionStorage.getItem(LOGIN_NOTICE_STORAGE_KEY);
        if (!raw) {
            return null;
        }

        return JSON.parse(raw) as LoginNotice;
    } catch {
        return null;
    }
};

export default function Accueil() {
    const navigate = useNavigate();
    const [notice, setNotice] = useState<LoginNotice | null>(() => readLoginNotice());
    const user = readStoredUser();
    const isAdmin = useMemo(() => {
        if (notice?.role) {
            return notice.role === "admin";
        }

        return userIsAdmin(user);
    }, [notice, user]);

    const closeNotice = () => {
        sessionStorage.removeItem(LOGIN_NOTICE_STORAGE_KEY);
        setNotice(null);
    };

    return (
        <div className="relative w-full">
            <Contenu />
            {notice ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                        <h2 className="text-xl font-bold text-gray-900">Connexion reussie</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Bienvenue {notice.name}. Votre session est active.
                        </p>
                        <p className="mt-2 text-sm text-gray-600">
                            {isAdmin
                                ? "Vous pouvez ouvrir le dashboard administrateur."
                                : "Vous pouvez ouvrir votre dashboard utilisateur (sans section clients)."}
                        </p>
                        <div className="mt-5 flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    closeNotice();
                                    navigate("/page-dashboard");
                                }}
                                className="rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white"
                            >
                                Acceder au dashboard
                            </button>
                            <button
                                type="button"
                                onClick={closeNotice}
                                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
                            >
                                Rester sur l'accueil
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
