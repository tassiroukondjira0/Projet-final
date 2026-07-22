import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import img1 from "../assets/img (1).jpg";
import img2 from "../assets/img (2).avif";
import img3 from "../assets/img (3).webp";
import img4 from "../assets/photo (1).jpg";
import img5 from "../assets/photo (2).jpg";
import img8 from "../assets/photo (5).jpg";
import { getCourses, type Course } from "../lib/api";
import { readStoredUser, userIsAdmin } from "../lib/auth";

// Les images sont des assets locaux au frontend : l'API ne les connaît pas,
// on les associe donc ici à chaque cours via son identifiant fixe (course_1..course_6).
const COURSE_IMAGES: Record<string, string> = {
  course_1: img1,
  course_2: img2,
  course_3: img3,
  course_4: img4,
  course_5: img8,
  course_6: img5,
};

// Repli utilisé si l'API est injoignable, pour que la page reste utilisable.
const FALLBACK_CLASSES: Course[] = [
  {
    id: "course_1",
    title: "Base Endurance",
    description: "Un cours cardio intense pour ameliorer votre souffle et votre resistance.",
    duration: 60,
    instructor: "Coach Awa",
    schedule: { day: "Lundi", time: "09:00 - 10:00" },
    scheduleSlots: [
      { day: "Lundi", time: "09:00 - 10:00" },
      { day: "Mardi", time: "10:30 - 11:15" },
      { day: "Mercredi", time: "18:00 - 18:45" },
      { day: "Jeudi", time: "19:00 - 19:45" },
      { day: "Vendredi", time: "21:00 - 21:30" },
      { day: "Samedi", time: "09:00 - 10:00" },
    ],
  },
  {
    id: "course_2",
    title: "Base HIIT",
    description: "Des sequences courtes et explosives pour bruler un maximum d'energie.",
    duration: 45,
    instructor: "Coach Idriss",
    schedule: { day: "Lundi", time: "10:30 - 11:15" },
    scheduleSlots: [
      { day: "Lundi", time: "10:30 - 11:15" },
      { day: "Mardi", time: "18:00 - 18:45" },
      { day: "Mercredi", time: "19:00 - 19:45" },
      { day: "Jeudi", time: "09:00 - 10:00" },
      { day: "Vendredi", time: "20:00 - 20:30" },
      { day: "Samedi", time: "10:30 - 11:15" },
    ],
  },
  {
    id: "course_3",
    title: "Base Force",
    description: "Un travail progressif de force pour tonifier tout le corps.",
    duration: 60,
    instructor: "Coach Mame",
    schedule: { day: "Mardi", time: "09:00 - 10:00" },
    scheduleSlots: [
      { day: "Lundi", time: "09:00 - 10:00" },
      { day: "Mardi", time: "09:00 - 10:00" },
      { day: "Mercredi", time: "10:30 - 11:15" },
      { day: "Jeudi", time: "18:00 - 18:45" },
      { day: "Vendredi", time: "19:00 - 19:45" },
      { day: "Samedi", time: "20:00 - 20:30" },
    ],
  },
  {
    id: "course_4",
    title: "Souplesse",
    description: "Des exercices de mobilite et d'etirements pour garder un corps souple.",
    duration: 45,
    instructor: "Coach Fatou",
    schedule: { day: "Mardi", time: "18:00 - 18:45" },
    scheduleSlots: [
      { day: "Lundi", time: "10:30 - 11:15" },
      { day: "Mardi", time: "18:00 - 18:45" },
      { day: "Mercredi", time: "09:00 - 10:00" },
      { day: "Jeudi", time: "19:00 - 19:45" },
      { day: "Vendredi", time: "09:00 - 10:00" },
      { day: "Samedi", time: "21:00 - 21:30" },
    ],
  },
  {
    id: "course_5",
    title: "Cardio",
    description: "Un entrainement rythme pour stimuler le coeur et augmenter l'endurance.",
    duration: 45,
    instructor: "Coach Moussa",
    schedule: { day: "Mercredi", time: "09:00 - 09:45" },
    scheduleSlots: [
      { day: "Lundi", time: "18:00 - 18:45" },
      { day: "Mardi", time: "19:00 - 19:45" },
      { day: "Mercredi", time: "09:00 - 09:45" },
      { day: "Jeudi", time: "20:00 - 20:30" },
      { day: "Vendredi", time: "10:30 - 11:15" },
      { day: "Samedi", time: "09:00 - 10:00" },
    ],
  },
  {
    id: "course_6",
    title: "Souffle",
    description: "Un cours centre sur la respiration pour mieux gerer l'effort et recuperer.",
    duration: 30,
    instructor: "Coach Aida",
    schedule: { day: "Mercredi", time: "20:00 - 20:30" },
    scheduleSlots: [
      { day: "Lundi", time: "19:00 - 19:45" },
      { day: "Mardi", time: "20:00 - 20:30" },
      { day: "Mercredi", time: "20:00 - 20:30" },
      { day: "Jeudi", time: "09:00 - 10:00" },
      { day: "Vendredi", time: "18:00 - 18:45" },
      { day: "Samedi", time: "19:00 - 19:45" },
    ],
  },
  {
    id: "course_7",
    title: "Power Training",
    description: "Un cours intense de musculation pour développer la puissance.",
    duration: 60,
    instructor: "Coach Awa",
    schedule: { day: "Jeudi", time: "09:00 - 10:00" },
    scheduleSlots: [
      { day: "Lundi", time: "21:00 - 21:30" },
      { day: "Mardi", time: "09:00 - 10:00" },
      { day: "Mercredi", time: "18:00 - 18:45" },
      { day: "Jeudi", time: "09:00 - 10:00" },
      { day: "Vendredi", time: "19:00 - 19:45" },
      { day: "Samedi", time: "10:30 - 11:15" },
    ],
  },
  {
    id: "course_8",
    title: "Yoga Flow",
    description: "Un cours de yoga dynamique pour améliorer flexibilité et équilibre.",
    duration: 45,
    instructor: "Coach Fatou",
    schedule: { day: "Jeudi", time: "19:00 - 19:45" },
    scheduleSlots: [
      { day: "Lundi", time: "09:00 - 10:00" },
      { day: "Mardi", time: "21:00 - 21:30" },
      { day: "Mercredi", time: "19:00 - 19:45" },
      { day: "Jeudi", time: "19:00 - 19:45" },
      { day: "Vendredi", time: "09:00 - 10:00" },
      { day: "Samedi", time: "18:00 - 18:45" },
    ],
  },
  {
    id: "course_9",
    title: "HIIT avancé",
    description: "Séquences avancées pour sportifs confirmés.",
    duration: 45,
    instructor: "Coach Idriss",
    schedule: { day: "Vendredi", time: "09:00 - 09:45" },
    scheduleSlots: [
      { day: "Lundi", time: "10:30 - 11:15" },
      { day: "Mardi", time: "09:00 - 10:00" },
      { day: "Mercredi", time: "21:00 - 21:30" },
      { day: "Jeudi", time: "10:30 - 11:15" },
      { day: "Vendredi", time: "09:00 - 09:45" },
      { day: "Samedi", time: "20:00 - 20:30" },
    ],
  },
  {
    id: "course_10",
    title: "Mobilité",
    description: "Exercices de mobilité articulaire pour tous niveaux.",
    duration: 30,
    instructor: "Coach Aida",
    schedule: { day: "Vendredi", time: "21:00 - 21:30" },
    scheduleSlots: [
      { day: "Lundi", time: "20:00 - 20:30" },
      { day: "Mardi", time: "10:30 - 11:15" },
      { day: "Mercredi", time: "09:00 - 10:00" },
      { day: "Jeudi", time: "18:00 - 18:45" },
      { day: "Vendredi", time: "21:00 - 21:30" },
      { day: "Samedi", time: "09:00 - 10:00" },
    ],
  },
  {
    id: "course_11",
    title: "Endurance matinale",
    description: "Démarrez votre journée avec un cours de cardio revitalisant.",
    duration: 60,
    instructor: "Coach Moussa",
    schedule: { day: "Samedi", time: "09:00 - 10:00" },
    scheduleSlots: [
      { day: "Lundi", time: "09:00 - 10:00" },
      { day: "Mardi", time: "18:00 - 18:45" },
      { day: "Mercredi", time: "20:00 - 20:30" },
      { day: "Jeudi", time: "09:00 - 10:00" },
      { day: "Vendredi", time: "18:00 - 18:45" },
      { day: "Samedi", time: "09:00 - 10:00" },
    ],
  },
  {
    id: "course_12",
    title: "Renforcement musculaire",
    description: "Renforcement ciblé pour tout le corps.",
    duration: 45,
    instructor: "Coach Mame",
    schedule: { day: "Samedi", time: "16:00 - 16:45" },
    scheduleSlots: [
      { day: "Lundi", time: "18:00 - 18:45" },
      { day: "Mardi", time: "19:00 - 19:45" },
      { day: "Mercredi", time: "10:30 - 11:15" },
      { day: "Jeudi", time: "20:00 - 20:30" },
      { day: "Vendredi", time: "09:00 - 10:00" },
      { day: "Samedi", time: "16:00 - 16:45" },
    ],
  },
];

export default function Cours() {
    const [classes, setClasses] = useState<Course[]>(FALLBACK_CLASSES);
    const [isLoadingError, setIsLoadingError] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const loadCourses = async () => {
            try {
                const response = await getCourses();
                if (isMounted && response.courses.length > 0) {
                    setClasses(response.courses);
                    setIsLoadingError(false);
                }
            } catch {
                if (isMounted) {
                    setIsLoadingError(true);
                }
            }
        };

        void loadCourses();

        return () => {
            isMounted = false;
        };
    }, []);

    const cardsPerPage = 3;
    const [currentPage, setCurrentPage] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const totalPages = Math.ceil(classes.length / cardsPerPage);

    const visibleClasses = useMemo(() => {
        const startIndex = currentPage * cardsPerPage;
        return classes.slice(startIndex, startIndex + cardsPerPage);
    }, [classes, currentPage]);

    useEffect(() => {
        if (totalPages <= 1 || isPaused) {
            return;
        }

        const intervalId = window.setInterval(() => {
            setCurrentPage((previousPage) => (previousPage + 1) % totalPages);
        }, 3500);

        return () => {
            window.clearInterval(intervalId);
        };
    }, [isPaused, totalPages]);

    return (
        <div>
            <section id="classes" className="bg-[#181818]">
                <div className="mx-auto max-w-6xl px-6 py-20">
                    <p className="text-sm uppercase tracking-[0.2em] text-orange-300">Nos cours</p>
                    <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">Choisissez votre rythme</h2>

                    {isLoadingError && (
                        <p className="mt-4 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
                            Impossible de charger les cours depuis le serveur. Affichage des données locales.
                        </p>
                    )}

                    <div className="mt-8 flex items-center justify-end">
                        <p className="text-sm text-gray-300">
                            Page {currentPage + 1} / {totalPages}
                        </p>
                    </div>

                    <div
                        className="mt-8 grid gap-6 md:grid-cols-3"
                        onMouseEnter={() => setIsPaused(true)}
                        onMouseLeave={() => setIsPaused(false)}
                    >
                        {visibleClasses.map((sportClass) => (
                            <article key={sportClass.id} className="group flex h-full flex-col rounded-lg bg-[#222222]">
                                <img
                                    src={COURSE_IMAGES[sportClass.id]}
                                    alt={sportClass.title}
                                    className="h-56 w-full rounded-t-lg object-cover"
                                />
                                <div className="flex flex-1 flex-col space-y-4 p-6">
                                    <h3 className="text-xl font-bold text-gray-300">{sportClass.title}</h3>
                                    <p className="flex-1 text-sm text-gray-300">{sportClass.description}</p>
                                    {typeof sportClass.availableSpots === "number" && (
                                        <p className="text-xs text-orange-300">
                                            {sportClass.availableSpots > 0
                                                ? `${sportClass.availableSpots} places disponibles`
                                                : "Complet"}
                                        </p>
                                    )}
                                    <div className="mt-2 space-y-1">
                                        <p className="text-xs font-semibold text-gray-400 uppercase">Horaires</p>
                                        {(sportClass.scheduleSlots && sportClass.scheduleSlots.length > 0 ? sportClass.scheduleSlots : [
                                            sportClass.schedule
                                        ]).map((slot, idx) => (
                                            <p key={idx} className="text-xs text-gray-400">
                                                {slot.day} · {slot.time}
                                            </p>
                                        ))}
                                    </div>
                                    {!userIsAdmin(readStoredUser()) && (
                                        <button
                                            type="button"
                                            className="mt-2 inline-flex w-full items-center justify-center rounded-md bg-orange-300 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#181818] opacity-100 transition-opacity duration-250 md:opacity-0 md:group-hover:opacity-100"
                                        >
                                            <Link to={`/booking/${sportClass.title.toLowerCase().replace(/\s+/g, "-")}`} className="w-full text-center">
                                                Reserver
                                            </Link>
                                        </button>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
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
                        <p className="font-semibold text-white">Liens</p>
                        <p className="mt-2">Politique de confidentialité</p>
                        <p>Conditions générales</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}