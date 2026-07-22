import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyCourses, type Course } from "../lib/api";
import { readStoredToken } from "../lib/auth";

const contentClassName = "min-h-screen bg-white px-4 pb-6 pt-20 dark:bg-gray-950 sm:px-6 lg:ml-54 lg:pt-21";

export default function DashboardMyCoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let isMounted = true;

        const loadMyCourses = async () => {
            try {
                const token = readStoredToken();
                if (!token) {
                    throw new Error("Session invalide.");
                }

                const response = await getMyCourses(token);
                if (isMounted) {
                    setCourses(response.courses);
                    setError("");
                }
            } catch (loadError) {
                if (isMounted) {
                    const message =
                        loadError instanceof Error
                            ? loadError.message
                            : "Impossible de charger vos cours.";
                    setError(message);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        void loadMyCourses();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <div className={contentClassName}>
            <header className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Mes cours</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Les cours dont vous êtes responsable, avec leurs disponibilités.
                </p>
            </header>

            {isLoading ? (
                <p className="text-sm text-gray-600 dark:text-gray-300">Chargement...</p>
            ) : null}

            {error ? (
                <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
            ) : null}

            {!isLoading && !error && courses.length === 0 ? (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    Aucun cours ne vous est encore attribué. Contactez un administrateur.
                </p>
            ) : null}

            {!isLoading && !error && courses.length > 0 ? (
                <div className="grid gap-4 xl:grid-cols-2">
                    {courses.map((course) => (
                        <section
                            key={course.id}
                            className="rounded-xl border border-gray-200 p-5 dark:border-gray-800"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                                        {course.title}
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        {course.schedule.day} · {course.schedule.time} · {course.duration} min
                                    </p>
                                </div>
                                {typeof course.availableSpots === "number" && (
                                    <span
                                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                                            course.availableSpots > 0
                                                ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                                                : "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                                        }`}
                                    >
                                        {course.availableSpots > 0 ? `${course.availableSpots} places` : "Complet"}
                                    </span>
                                )}
                            </div>

                            <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">{course.description}</p>

                            <Link
                                to={`/page-dashboard/my-courses/${course.id}`}
                                className="mt-4 inline-flex items-center rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
                            >
                                Voir les inscrits
                            </Link>
                        </section>
                    ))}
                </div>
            ) : null}
        </div>
    );
}
