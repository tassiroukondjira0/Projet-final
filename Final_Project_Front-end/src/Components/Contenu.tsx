import video from "../assets/Video.mp4";
import img3 from "../assets/img (3).webp";
import { Link } from "react-router-dom";
import ContactForm from "./ContactForm";
import { readStoredUser, userIsAdmin } from "../lib/auth";

const benefits = [
    {
        title: "Communauté",
        text: "Un cadre motivant avec des personnes qui avancent vers les mêmes objectifs.",
    },
    {
        title: "Motivation",
        text: "Un suivi régulier avec un coach pour garder le rythme et progresser chaque semaine.",
    },
    {
        title: "Résultats",
        text: "Des programmes structurés qui transforment la condition physique et la confiance en soi.",
    },
];

export default function Contenu() {
    return (
        <div className="w-full bg-[#111111] text-white">
            <section className="relative min-h-screen overflow-hidden">
                <video
                    className="absolute inset-0 h-full w-full object-cover"
                    src={video}
                    autoPlay
                    loop
                    muted
                    playsInline
                />
                <div className="absolute inset-0 bg-black/55" />

                <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-20">
                    <p className="text-sm uppercase tracking-[0.2em] text-orange-300">
                        FitClub - Studio de fitness fonctionnel
                    </p>
                    <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
                        La où le fitness devient votre style de vie
                    </h1>
                    <p className="mt-5 max-w-2xl text-base text-gray-200 md:text-lg">
                        Entrainement personnalisé, cours de groupe et accompagnement complet pour atteindre vos objectifs.
                    </p>
                    {!userIsAdmin(readStoredUser()) && (
                        <Link
                            to="/cours"
                            className="mt-8 inline-flex w-fit items-center rounded-md bg-[#e95537] px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-[#c6492f]"
                        >
                            Réserver un cours
                        </Link>
                    )}
                </div>
            </section>


            <section id="plans" className="bg-[#f5f4f1] text-gray-900">
                <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-2 md:items-center">
                    <div>
                        <h2 className="text-3xl font-bold leading-tight md:text-4xl">
                            Rejoignez FitClub et transformez votre corps et votre mental.
                        </h2>
                        <div className="mt-8 grid gap-4 sm:grid-cols-3">
                            {benefits.map((benefit) => (
                                <article key={benefit.title} className="rounded-md border border-gray-300 p-4">
                                    <h3 className="text-lg font-semibold">{benefit.title}</h3>
                                    <p className="mt-2 text-sm leading-relaxed text-gray-700">{benefit.text}</p>
                                </article>
                            ))}
                        </div>
                    </div>

                    <img
                        src={img3}
                        alt="Coach sportif avec ses eleves"
                        className="h-80 w-full rounded-lg object-cover md:h-115"
                    />
                </div>
            </section>

            <section id="contact" className="bg-[#111111]">
                <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-2">
                    <div>
                        <p className="text-sm uppercase tracking-[0.2em] text-orange-300">Allons-y</p>
                        <h2 className="mt-3 text-3xl font-bold md:text-4xl">Inscrivez-vous aux mises a jour</h2>
                        <p className="mt-4 max-w-md text-sm text-gray-300">
                            Recevez nos nouveaux cours, nos offres de lancement et les prochaines dates des séances.
                        </p>
                    </div>

                    <ContactForm />
                </div>
            </section>

            <footer className="border-t border-white/10 bg-[#0b0b0b]">
                <div className="mx-auto grid max-w-6xl gap-6 px-6 py-10 text-sm text-gray-300 md:grid-cols-3">
                    <div>
                        <p className="font-semibold text-white">Adresse</p>
                        <p className="mt-2">Rue Mz 83</p>
                        <p>Dakar, SICAP Mermouz</p>
                    </div>
                    <div>
                        <p className="font-semibold text-white">Contact</p>
                        <p className="mt-2">tassirou44@gmail.com</p>
                        <p>+221-77-565-38-57</p>
                    </div>
                    <div>
                        <p className="font-semibold text-white">Suivez-nous</p>
                        <div className="mt-3 flex items-center gap-4">
                            <a href="https://wa.me/221775653857" target="_blank" rel="noreferrer" className="text-white transition hover:text-orange-300" aria-label="WhatsApp">
                                <img src="/social-logos/whatsapp.svg" alt="WhatsApp" className="h-6 w-6" />
                            </a>
                            <a href="https://www.instagram.com/fitclub" target="_blank" rel="noreferrer" className="text-white transition hover:text-orange-300" aria-label="Instagram">
                                <img src="/social-logos/instagram.svg" alt="Instagram" className="h-6 w-6" />
                            </a>
                            <a href="https://www.facebook.com/fitclub" target="_blank" rel="noreferrer" className="text-white transition hover:text-orange-300" aria-label="Facebook">
                                <img src="/social-logos/facebook.png" alt="Facebook" className="h-6 w-6" />
                            </a>
                            <a href="https://www.tiktok.com/@fitclub" target="_blank" rel="noreferrer" className="text-white transition hover:text-orange-300" aria-label="TikTok">
                                <img src="/social-logos/tiktok.jpg" alt="TikTok" className="h-6 w-6" />
                            </a>
                            <a href="https://www.linkedin.com/company/fitclub" target="_blank" rel="noreferrer" className="text-white transition hover:text-orange-300" aria-label="LinkedIn">
                                <img src="/social-logos/linkedin.png" alt="LinkedIn" className="h-6 w-6" />
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}