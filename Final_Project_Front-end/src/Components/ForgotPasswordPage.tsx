import { useState } from "react";
import type { FormEvent } from "react";
import { requestPasswordReset } from "../lib/api";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");
        setMessage("");
        setIsLoading(true);

        try {
            const response = await requestPasswordReset(email);
            setMessage(response.message);
        } catch (submitError) {
            if (submitError instanceof Error) {
                setError(submitError.message);
            } else {
                setError("Impossible d'envoyer la demande.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center px-4 py-8">
            <form
                onSubmit={onSubmit}
                className="flex w-full max-w-md flex-col gap-4 rounded-2xl border border-gray-200 p-6 shadow-lg sm:p-8 md:p-10"
            >
                <h2 className="text-2xl font-bold">Mot de passe oublie</h2>
                <p className="text-sm text-gray-400">Entrez votre email pour reinitialiser</p>
                <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="rounded border border-gray-300 px-3 py-2 text-sm"
                    required
                />

                {error ? (
                    <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                        {error}
                    </p>
                ) : null}
                {message ? (
                    <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                        {message}
                    </p>
                ) : null}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="rounded-full bg-orange-500 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {isLoading ? "Envoi..." : "ENVOYER"}
                </button>
            </form>
        </div>
    );
}
