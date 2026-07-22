import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import ill from "../assets/ChatGPT Image 1 mai 2026, 19_49_34.png";
import photo from "../assets/pic.jpg";
import { login } from "../lib/api";
import { LOGIN_NOTICE_STORAGE_KEY, persistAuth } from "../lib/auth";

export default function LoginPage() {
    const [show, setShow] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const response = await login(email, password);
            persistAuth(response.token, response.user);
            const resolvedRole =
                response.user.role ??
                (response.user.email === "tassirou44@gmail.com" || response.user.id === "user_admin"
                    ? "admin"
                    : "client");
            sessionStorage.setItem(
                LOGIN_NOTICE_STORAGE_KEY,
                JSON.stringify({
                    name: response.user.name,
                    role: resolvedRole,
                }),
            );
            navigate("/", { replace: true });
        } catch (submitError) {
            if (submitError instanceof Error) {
                setError(submitError.message);
            } else {
                setError("Impossible de se connecter.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full flex-col bg-white lg:flex-row">
            <div className="flex w-full items-center justify-center px-4 py-8 lg:w-2/3 lg:px-8">
                <form
                    onSubmit={onSubmit}
                    className="flex w-full max-w-md flex-col gap-4 rounded-2xl border border-gray-200 p-6 shadow-lg sm:p-8 lg:p-10"
                >
                    <img src={photo} alt="Logo" className="h-12 w-12" />

                    <div>
                        <p className="font-semibold text-gray-700">Bienvenue</p>
                        <h2 className="text-3xl font-bold">Connexion</h2>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-600" htmlFor="email">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            className="rounded border border-gray-300 px-3 py-2 text-sm"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <div className="flex justify-between">
                            <label className="text-sm text-gray-600" htmlFor="password">
                                Password
                            </label>
                            <Link to="/forgot-password" className="text-sm text-gray-400">
                                Mot de passe oublie ?
                            </Link>
                        </div>
                        <div className="flex rounded border border-gray-300 px-3 py-2">
                            <input
                                id="password"
                                type={show ? "text" : "password"}
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                className="flex-1 text-sm outline-none"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShow((previous) => !previous)}
                                className="text-xs font-semibold text-gray-500"
                            >
                                {show ? "🙈" : "👁️"}
                            </button>
                        </div>
                    </div>

                    {error ? (
                        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                            {error}
                        </p>
                    ) : null}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="mt-2 rounded-full bg-orange-500 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {isLoading ? "Connexion..." : "SE CONNECTER"}
                    </button>

                    <p className="text-center text-sm text-gray-500">
                        Nouveau ici ?{" "}
                        <Link to="/register" className="font-semibold text-orange-500">
                            Creer un compte
                        </Link>
                    </p>
                </form>
            </div>

            <div className="hidden w-1/3 items-center justify-center bg-orange-50 lg:flex">
                <img src={ill} alt="illustration" className="h-auto w-full object-cover" />
            </div>
        </div>
    );
}
