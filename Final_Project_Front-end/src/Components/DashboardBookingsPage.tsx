import { useEffect, useState } from "react";
import { readStoredToken } from "../lib/auth";
import { getMyBookings, type Booking } from "../lib/api";

export default function DashboardBookingsPage() {
  const token = readStoredToken();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBookings = async () => {
      try {
        setLoading(true);
        if (!token) {
          setError("Token non trouvé");
          return;
        }
        const response = await getMyBookings(token);
        setBookings(response.bookings);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur lors du chargement des réservations");
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [token]);

  const getSubscriptionLabel = (type: string) => {
    const labels: Record<string, string> = {
      session: "Par séance",
      monthly: "Mensuel",
      annual: "Annuel",
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: string) => {
    if (status === "completed") {
      return <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">Payé</span>;
    }
    return <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm">En attente</span>;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Mes Réservations</h1>
          <p className="text-gray-400 mt-2">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Mes Réservations</h1>
        <p className="text-gray-400 mt-2">Gestion de vos réservations de cours et abonnements</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/20 p-4 text-red-200">
          {error}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="rounded-lg bg-[#222222] p-12 text-center">
          <p className="text-gray-400 mb-4">Aucune réservation pour le moment</p>
          <p className="text-gray-500 text-sm">Commencez par réserver un cours dans la section "Cours"</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="rounded-lg bg-[#222222] p-6 border border-gray-700">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    Réservation #{booking.id.slice(0, 8)}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Créée le {new Date(booking.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                {getStatusBadge(booking.paymentStatus)}
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-4">
                <div>
                  <p className="text-gray-400 text-sm">Type d'abonnement</p>
                  <p className="text-white font-semibold">{getSubscriptionLabel(booking.subscriptionType)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Montant</p>
                  <p className="text-orange-300 font-semibold">{booking.amount} FCFA</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Méthode de paiement</p>
                  <p className="text-white font-semibold">
                    {booking.paymentMethod ? (
                      booking.paymentMethod === "wave"
                        ? "Wave"
                        : booking.paymentMethod === "orange_money"
                          ? "Orange Money"
                          : "Carte Bancaire"
                    ) : (
                      "Non défini"
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Statut</p>
                  <p className="text-white font-semibold">
                    {booking.paymentStatus === "completed" ? "Confirmé" : "En attente"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
