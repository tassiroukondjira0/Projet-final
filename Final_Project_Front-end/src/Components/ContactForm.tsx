import { useState } from "react";
import type { FormEvent } from "react";
import { sendContactMessage } from "../lib/api";

export default function ContactForm() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [statusMessage, setStatusMessage] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");
        setStatusMessage("");
        setIsLoading(true);

        try {
            const response = await sendContactMessage({
                firstName,
                lastName,
                email,
                message,
            });
            setStatusMessage(response.message);
            setFirstName("");
            setLastName("");
            setEmail("");
            setMessage("");
        } catch (submitError) {
            if (submitError instanceof Error) {
                setError(submitError.message);
            } else {
                setError("Impossible d'envoyer le message.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form className="grid gap-4" onSubmit={onSubmit}>
            <input
                type="text"
                placeholder="Prenom"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                className="h-11 rounded-md border border-white/20 bg-white/5 px-4 text-sm text-white placeholder:text-gray-400 outline-none focus:border-orange-300"
                required
            />
            <input
                type="text"
                placeholder="Nom"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                className="h-11 rounded-md border border-white/20 bg-white/5 px-4 text-sm text-white placeholder:text-gray-400 outline-none focus:border-orange-300"
                required
            />
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-11 rounded-md border border-white/20 bg-white/5 px-4 text-sm text-white placeholder:text-gray-400 outline-none focus:border-orange-300"
                required
            />
            <textarea
                placeholder="Votre message"
                rows={4}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                className="rounded-md border border-white/20 bg-white/5 p-4 text-sm text-white placeholder:text-gray-400 outline-none focus:border-orange-300"
                required
            />

            {error ? <p className="text-sm text-red-300">{error}</p> : null}
            {statusMessage ? <p className="text-sm text-emerald-300">{statusMessage}</p> : null}

            <button
                type="submit"
                disabled={isLoading}
                className="h-11 rounded-md bg-[#e95537] text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-[#c6492f] disabled:cursor-not-allowed disabled:opacity-70"
            >
                {isLoading ? "Envoi..." : "Envoyer"}
            </button>
        </form>
    );
}
