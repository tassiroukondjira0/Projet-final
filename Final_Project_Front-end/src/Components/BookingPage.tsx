import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  readStoredToken,
  readStoredUser,
  userIsAdmin,
} from "../lib/auth";
import {
  getCourseById,
  createBooking,
  processPayment,
  PRICING,
  type SubscriptionType,
  type Course,
} from "../lib/api";
import { getCourseIdFromSlug } from "../lib/courses";

type PaymentMethod = "wave" | "orange_money" | "card" | undefined;

export default function BookingPage() {
  const navigate = useNavigate();
  const { courseId: courseSlug } = useParams<{ courseId: string }>();

  const token = readStoredToken();
  const user = readStoredUser();

  // Convertir le slug en ID réel
  const courseId = courseSlug ? getCourseIdFromSlug(courseSlug) : undefined;

  // Redirection si pas connecté ou si admin
  useEffect(() => {
    if (!token || !user) {
      navigate("/login", { replace: true });
    } else if (userIsAdmin(user)) {
      navigate("/page-dashboard", { replace: true });
    }
  }, [token, user, navigate]);

  const [course, setCourse] = useState<Course | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [subscriptionType, setSubscriptionType] = useState<SubscriptionType>("session");
  const [bookingStep, setBookingStep] = useState<"select" | "payment" | "success">("select");
  const [currentBookingId, setCurrentBookingId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(undefined);
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || "");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const loadCourse = async () => {
      try {
        setLoading(true);

        if (!courseId) {
          setError("Course ID manquant");
          return;
        }

        const response = await getCourseById(courseId);
        setCourse(response.course);
        setError("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur lors du chargement du cours");
      } finally {
        setLoading(false);
      }
    };

    void loadCourse();
  }, [courseId]);

  const amount = PRICING[subscriptionType];

  const handleCreateBooking = async () => {
    try {
      setIsProcessing(true);
      setError("");

      if (!token || !courseId) {
        setError("Données manquantes");
        return;
      }

      const booking = await createBooking(token, {
        courseId,
        subscriptionType,
      });

      setCurrentBookingId(booking.booking.id);
      setBookingStep("payment");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la création de la réservation");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessPayment = async () => {
    try {
      setIsProcessing(true);
      setError("");

      if (!token || !currentBookingId) {
        setError("Données de paiement manquantes");
        return;
      }

      if (!paymentMethod) {
        setError("Veuillez sélectionner un mode de paiement");
        return;
      }

      if ((paymentMethod === "wave" || paymentMethod === "orange_money") && !phoneNumber) {
        setError("Le numéro de téléphone est requis");
        return;
      }

      const payment = await processPayment(token, {
        bookingId: currentBookingId,
        paymentMethod,
        phoneNumber: paymentMethod !== "card" ? phoneNumber : undefined,
      });

      if (payment.payment.status === "completed") {
        setBookingStep("success");
      } else {
        setError("Paiement échoué");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du paiement");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!token || !user) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#181818]">
        <p className="text-white">Chargement...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#181818]">
        <p className="text-red-500">{error || "Cours non trouvé"}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181818] py-12">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-[#222222] p-8 shadow-lg">
          <h1 className="mb-2 text-3xl font-bold text-white">{course.title}</h1>
          <p className="mb-6 text-gray-300">{course.description}</p>

          {error && (
            <div className="mb-6 rounded-lg bg-red-500/20 p-4 text-red-200">{error}</div>
          )}

          {bookingStep === "select" && (
            <div className="space-y-6">
              <div>
                <h2 className="mb-4 text-xl font-semibold text-white">Choisir un abonnement</h2>

                <div className="space-y-3">
                  <label className="cursor-pointer rounded-lg border border-gray-600 p-4 transition hover:bg-gray-800/50">
                    <input
                      type="radio"
                      name="subscription"
                      value="session"
                      checked={subscriptionType === "session"}
                      onChange={(e) => setSubscriptionType(e.target.value as SubscriptionType)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-white">Par séance</p>
                      <p className="text-sm text-gray-400">Accès à une session unique</p>
                    </div>
                    <span className="text-lg font-bold text-orange-300">{PRICING.session} FCFA</span>
                  </label>

                  <label className="cursor-pointer rounded-lg border border-gray-600 p-4 transition hover:bg-gray-800/50">
                    <input
                      type="radio"
                      name="subscription"
                      value="monthly"
                      checked={subscriptionType === "monthly"}
                      onChange={(e) => setSubscriptionType(e.target.value as SubscriptionType)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-white">Mensuel</p>
                      <p className="text-sm text-gray-400">Accès illimité pendant 1 mois</p>
                    </div>
                    <span className="text-lg font-bold text-orange-300">{PRICING.monthly} FCFA</span>
                  </label>

                  <label className="cursor-pointer rounded-lg border-2 border-orange-500 p-4 transition hover:bg-gray-800/50">
                    <input
                      type="radio"
                      name="subscription"
                      value="annual"
                      checked={subscriptionType === "annual"}
                      onChange={(e) => setSubscriptionType(e.target.value as SubscriptionType)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-white">Annuel</p>
                        <span className="rounded bg-orange-500 px-2 py-1 text-xs text-white">Meilleure offre</span>
                      </div>
                      <p className="text-sm text-gray-400">Accès illimité pendant 1 an</p>
                    </div>
                    <span className="text-lg font-bold text-orange-300">{PRICING.annual} FCFA</span>
                  </label>
                </div>
              </div>

              <div className="border-t border-gray-600 pt-6">
                <p className="mb-4 text-gray-300">
                  Montant total: <span className="text-2xl font-bold text-orange-300">{amount} FCFA</span>
                </p>
                <button
                  onClick={handleCreateBooking}
                  disabled={isProcessing}
                  className="w-full rounded-lg bg-orange-500 px-4 py-3 font-bold text-white transition hover:bg-orange-600 disabled:bg-gray-600"
                >
                  {isProcessing ? "Traitement..." : "Procéder au paiement"}
                </button>
              </div>
            </div>
          )}

          {bookingStep === "payment" && (
            <div className="space-y-6">
              <div>
                <h2 className="mb-4 text-xl font-semibold text-white">Mode de paiement</h2>

                <div className="space-y-3 mb-6">
                  <label className="cursor-pointer rounded-lg border border-gray-600 p-4 transition hover:bg-gray-800/50">
                    <input
                      type="radio"
                      name="payment"
                      value="wave"
                      checked={paymentMethod === "wave"}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-white">Wave</p>
                      <p className="text-sm text-gray-400">Paiement mobile avec Wave</p>
                    </div>
                  </label>

                  <label className="cursor-pointer rounded-lg border border-gray-600 p-4 transition hover:bg-gray-800/50">
                    <input
                      type="radio"
                      name="payment"
                      value="orange_money"
                      checked={paymentMethod === "orange_money"}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-white">Orange Money</p>
                      <p className="text-sm text-gray-400">Paiement mobile avec Orange Money</p>
                    </div>
                  </label>

                  <label className="cursor-pointer rounded-lg border border-gray-600 p-4 transition hover:bg-gray-800/50">
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-white">Carte bancaire</p>
                      <p className="text-sm text-gray-400">Visa, Mastercard</p>
                    </div>
                  </label>
                </div>

                {(paymentMethod === "wave" || paymentMethod === "orange_money") && (
                  <div className="mb-6">
                    <label className="mb-2 block text-sm font-semibold text-white">Numéro de téléphone</label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Ex: +221701234567"
                      className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                )}
              </div>

              <div className="border-t border-gray-600 pt-6">
                <p className="mb-4 text-gray-300">
                  Montant à payer: <span className="text-2xl font-bold text-orange-300">{amount} FCFA</span>
                </p>
                <div className="space-y-3">
                  <button
                    onClick={handleProcessPayment}
                    disabled={isProcessing}
                    className="w-full rounded-lg bg-orange-500 px-4 py-3 font-bold text-white transition hover:bg-orange-600 disabled:bg-gray-600"
                  >
                    {isProcessing ? "Traitement du paiement..." : "Confirmer le paiement"}
                  </button>

                  <button
                    onClick={() => setBookingStep("select")}
                    disabled={isProcessing}
                    className="w-full rounded-lg bg-gray-700 px-4 py-3 font-bold text-white transition hover:bg-gray-600 disabled:bg-gray-800"
                  >
                    Retour
                  </button>
                </div>
              </div>
            </div>
          )}

          {bookingStep === "success" && (
            <div className="space-y-6 text-center">
              <div className="mb-4 text-6xl">✅</div>
              <h2 className="text-2xl font-bold text-green-400">Paiement réussi!</h2>
              <p className="text-gray-300">
                Votre réservation pour le cours <span className="font-semibold">{course.title}</span> a été confirmée.
              </p>
              <p className="text-lg font-semibold text-orange-300">{amount} FCFA payés</p>
              <button
                onClick={() => navigate("/page-dashboard")}
                className="w-full rounded-lg bg-orange-500 px-4 py-3 font-bold text-white transition hover:bg-orange-600"
              >
                Voir mes réservations
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

