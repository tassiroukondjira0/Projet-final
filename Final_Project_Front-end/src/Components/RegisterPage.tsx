import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import ill from "../assets/ChatGPT Image 1 mai 2026, 19_49_34.png";
import photo from "../assets/pic.jpg";
import { register } from "../lib/api";
import { LOGIN_NOTICE_STORAGE_KEY, persistAuth } from "../lib/auth";

export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [country, setCountry] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }

        // Validation: tous les champs sont obligatoires
        if (!name || !email || !password || !phone || !birthDate || !address || !city || !country) {
            setError("Tous les champs sont obligatoires.");
            return;
        }

        if (password.length < 6) {
            setError("Le mot de passe doit contenir au moins 6 caractères.");
            return;
        }

        setIsLoading(true);

        try {
            const response = await register({
                name,
                email,
                password,
                phone,
                birthDate,
                address,
                city,
                country,
            });
            persistAuth(response.token, response.user);
            const resolvedRole =
                response.user.role ??
                (response.user.email === "admin@fitclub.com" || response.user.id === "user_admin"
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
                setError("Impossible de creer le compte.");
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
                        <h2 className="text-3xl font-bold">Inscription</h2>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-600" htmlFor="name">
                            Nom complet
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            className="rounded border border-gray-300 px-3 py-2 text-sm"
                            required
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
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
                            <label className="text-sm text-gray-600" htmlFor="phone">
                                Telephone
                            </label>
                            <input
                                id="phone"
                                type="tel"
                                value={phone}
                                onChange={(event) => setPhone(event.target.value)}
                                className="rounded border border-gray-300 px-3 py-2 text-sm"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-gray-600" htmlFor="birthDate">
                                Date de naissance
                            </label>
                            <input
                                id="birthDate"
                                type="date"
                                value={birthDate}
                                onChange={(event) => setBirthDate(event.target.value)}
                                className="rounded border border-gray-300 px-3 py-2 text-sm"
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-gray-600" htmlFor="city">
                                Ville
                            </label>
                            <input
                                id="city"
                                type="text"
                                value={city}
                                onChange={(event) => setCity(event.target.value)}
                                className="rounded border border-gray-300 px-3 py-2 text-sm"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-gray-600" htmlFor="country">
                                Pays
                            </label>
                            <input
                                id="country"
                                type="text"
                                value={country}
                                onChange={(event) => setCountry(event.target.value)}
                                className="rounded border border-gray-300 px-3 py-2 text-sm"
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-gray-600" htmlFor="address">
                                Adresse
                            </label>
                            <input
                                id="address"
                                type="text"
                                value={address}
                                onChange={(event) => setAddress(event.target.value)}
                                className="rounded border border-gray-300 px-3 py-2 text-sm"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-600" htmlFor="password">
                            Mot de passe
                        </label>
                        <div className="flex rounded border border-gray-300 px-3 py-2">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                className="flex-1 text-sm outline-none"
                                minLength={6}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((previous) => !previous)}
                                className="text-xs font-semibold text-gray-500"
                            >
                                {showPassword ? "🙈" : "👁️"}
                            </button> 
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-600" htmlFor="confirmPassword">
                            Confirmer le mot de passe
                        </label>
                        <div className="flex rounded border border-gray-300 px-3 py-2">
                            <input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(event) => setConfirmPassword(event.target.value)}
                                className="flex-1 text-sm outline-none"
                                minLength={6}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword((previous) => !previous)}
                                className="text-xs font-semibold text-gray-500"
                            >
                                {showConfirmPassword ? "🙈" : "👁️"}
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
                        {isLoading ? "Creation..." : "CREER UN COMPTE"}
                    </button>

                    <p className="text-center text-sm text-gray-500">
                        Deja inscrit ?{" "}
                        <Link to="/login" className="font-semibold text-orange-500">
                            Se connecter
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
