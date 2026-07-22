import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getCourseBookings, type CourseBooking } from "../lib/api";
import { readStoredToken } from "../lib/auth";

const contentClassName = "min-h-screen bg-white px-4 pb-6 pt-20 dark:bg-gray-950 sm:px-6 lg:ml-54 lg:pt-21";

const SUBSCRIPTION_LABELS: Record<string, string> = {
    session: "Par séance",
    monthly: "Mensuel",
    annual: "Annuel",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
    completed: "Payé",
    pending: "En attente",
    failed: "Échoué",
};

export default function DashboardCourseStudentsPage() {
    const { courseId } = useParams<{ courseId: string }>();
    const [bookings, setBookings] = useState<CourseBooking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let isMounted = true;

        const loadBookings = async () => {
            try {
                const token = readStoredToken();
                if (!token || !courseId) {
                    throw new Error("Session ou cours invalide.");
                }

                const response = await getCourseBookings(token, courseId);
                if (isMounted) {
                    setBookings(response.bookings);
                    setError("");
                }
            } catch (loadError) {
                if (isMounted) {
                    const message =
                        loadError instanceof Error
                            ? loadError.message
                            : "Impossible de charger les inscrits.";
                    setError(message);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        void loadBookings();

        return () => {
            isMounted = false;
        };
    }, [courseId]);

    return (
        <div className={contentClassName}>
            <header className="mb-6">
                <Link
                    to="/page-dashboard/my-courses"
                    className="text-sm text-orange-600 hover:underline dark:text-orange-400"
                >
                    ← Retour à mes cours
                </Link>
                <h2 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
                    Clients inscrits
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Liste des clients ayant réservé ce cours.
                </p>
            </header>

            {isLoading ? (
                <p className="text-sm text-gray-600 dark:text-gray-300">Chargement...</p>
            ) : null}

            {error ? (
                <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
            ) : null}

            {!isLoading && !error && bookings.length === 0 ? (
                <p className="text-sm text-gray-600 dark:text-gray-300">Aucun client inscrit pour le moment.</p>
            ) : null}

            {!isLoading && !error && bookings.length > 0 ? (
                <section className="rounded-xl border border-gray-200 p-4 dark:border-gray-800 xl:col-span-2">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-160 text-left text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                                    <th className="px-2 py-3 font-medium">Nom</th>
                                    <th className="px-2 py-3 font-medium">Email</th>
                                    <th className="px-2 py-3 font-medium">Téléphone</th>
                                    <th className="px-2 py-3 font-medium">Abonnement</th>
                                    <th className="px-2 py-3 font-medium">Montant</th>
                                    <th className="px-2 py-3 font-medium">Statut</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map((booking) => (
                                    <tr key={booking.id} className="border-b border-gray-100 dark:border-gray-900">
                                        <td className="px-2 py-3 text-gray-900 dark:text-white">{booking.userId.name}</td>
                                        <td className="px-2 py-3 text-gray-600 dark:text-gray-300">{booking.userId.email}</td>
                                        <td className="px-2 py-3 text-gray-600 dark:text-gray-300">{booking.userId.phone || "—"}</td>
                                        <td className="px-2 py-3 text-gray-600 dark:text-gray-300">
                                            {SUBSCRIPTION_LABELS[booking.subscriptionType] ?? booking.subscriptionType}
                                        </td>
                                        <td className="px-2 py-3 text-gray-600 dark:text-gray-300">{booking.amount} FCFA</td>
                                        <td className="px-2 py-3 text-gray-600 dark:text-gray-300">
                                            {PAYMENT_STATUS_LABELS[booking.paymentStatus] ?? booking.paymentStatus}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            ) : null}
        </div>
    );
}
