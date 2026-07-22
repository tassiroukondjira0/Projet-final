import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  getCourses,
  getCurrentUser,
  getDashboardClients,
  updateCurrentUser,
  getCourseCoaches,
  addCoachToCourse,
  removeCoachFromCourse,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../lib/api";
import type { AuthUser, Course, DashboardClient, UpdateProfilePayload, CourseCoach, Notification } from "../lib/api";
import { persistAuth, readStoredToken, readStoredUser } from "../lib/auth";

type DashboardSectionProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

const contentClassName =
  "min-h-screen bg-white px-4 pb-6 pt-20 dark:bg-gray-950 sm:px-6 lg:ml-54 lg:pt-21";

function DashboardSection({ title, subtitle, children }: DashboardSectionProps) {
  return (
    <div className={contentClassName}>
      <header className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{title}</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
      </header>
      <div className="grid gap-4 xl:grid-cols-2">{children}</div>
    </div>
  );
}

const readCurrentUser = () => readStoredUser();

const formatDate = (isoDate: string) => {
  if (!isoDate) return "Non renseigne";

  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const createProfileForm = (user: AuthUser | null): UpdateProfilePayload => {
  return {
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    birthDate: user?.birthDate ?? "",
    address: user?.address ?? "",
    city: user?.city ?? "",
    country: user?.country ?? "",
  };
};

const FALLBACK_COURSES: Course[] = [
  {
    id: "course_1",
    title: "Base Endurance",
    description: "",
    duration: 60,
    instructor: "",
    schedule: { day: "Lundi", time: "09:00 - 10:00" },
  },
  {
    id: "course_2",
    title: "Base HIIT",
    description: "",
    duration: 45,
    instructor: "",
    schedule: { day: "Lundi", time: "10:30 - 11:15" },
  },
  {
    id: "course_3",
    title: "Base Force",
    description: "",
    duration: 60,
    instructor: "",
    schedule: { day: "Mardi", time: "09:00 - 10:00" },
  },
  {
    id: "course_4",
    title: "Souplesse",
    description: "",
    duration: 45,
    instructor: "Coach Fatou",
    schedule: { day: "Mardi", time: "18:00 - 18:45" },
  },
  {
    id: "course_5",
    title: "Cardio",
    description: "",
    duration: 45,
    instructor: "",
    schedule: { day: "Mercredi", time: "09:00 - 09:45" },
  },
  {
    id: "course_6",
    title: "Souffle",
    description: "",
    duration: 30,
    instructor: "",
    schedule: { day: "Mercredi", time: "20:00 - 20:30" },
  },
  {
    id: "course_7",
    title: "Power Training",
    description: "",
    duration: 60,
    instructor: "",
    schedule: { day: "Jeudi", time: "09:00 - 10:00" },
  },
  {
    id: "course_8",
    title: "Yoga Flow",
    description: "",
    duration: 45,
    instructor: "",
    schedule: { day: "Jeudi", time: "19:00 - 19:45" },
  },
  {
    id: "course_9",
    title: "HIIT avancé",
    description: "",
    duration: 45,
    instructor: "",
    schedule: { day: "Vendredi", time: "09:00 - 09:45" },
  },
  {
    id: "course_10",
    title: "Mobilité",
    description: "",
    duration: 30,
    instructor: "",
    schedule: { day: "Vendredi", time: "21:00 - 21:30" },
  },
  {
    id: "course_11",
    title: "Endurance matinale",
    description: "",
    duration: 60,
    instructor: "",
    schedule: { day: "Samedi", time: "09:00 - 10:00" },
  },
  {
    id: "course_12",
    title: "Renforcement musculaire",
    description: "",
    duration: 45,
    instructor: "",
    schedule: { day: "Samedi", time: "16:00 - 16:45" },
  },
];

export function DashboardCoursesPage() {
  const [courses, setCourses] = useState<Course[]>(FALLBACK_COURSES);
  const [coachesMap, setCoachesMap] = useState<Record<string, CourseCoach[]>>({});
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadCourses = async () => {
      try {
        const response = await getCourses();
        if (isMounted && response.courses.length > 0) {
          setCourses(response.courses);
          setError("");
        }
      } catch {
        if (isMounted) {
          setError("Impossible de charger les cours depuis l'API. Affichage des données locales.");
        }
      }
    };

    void loadCourses();

    return () => {
      isMounted = false;
    };
  }, []);

  const formatAvailability = (course: Course) => {
    if (typeof course.availableSpots !== "number") return "—";
    return course.availableSpots > 0 ? `${course.availableSpots} places` : "Complet";
  };

  const loadCourseCoaches = async (courseId: string) => {
    const token = readStoredToken();
    if (!token) return;

    try {
      const response = await getCourseCoaches(token, courseId);
      setCoachesMap((prev) => ({ ...prev, [courseId]: response.coaches }));
    } catch (err) {
      console.error("Erreur chargement coachs du cours", err);
    }
  };

  return (
    <DashboardSection title="Courses" subtitle="Planification des sessions et disponibilites.">
      {error ? (
        <p className="xl:col-span-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
          {error}
        </p>
      ) : null}

      <section className="rounded-xl border border-gray-200 p-4 dark:border-gray-800 xl:col-span-2">
        <div className="overflow-x-auto">
          <table className="w-full min-w-120 text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                <th className="px-2 py-3 font-medium">Cours</th>
                <th className="px-2 py-3 font-medium">Horaire</th>
                <th className="px-2 py-3 font-medium">Coach</th>
                <th className="px-2 py-3 font-medium">Disponibilite</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => {
                const courseCoaches = coachesMap[course.id];
                const displayCoaches =
                  courseCoaches && courseCoaches.length > 0
                    ? courseCoaches.map((c) => c.name).join(", ")
                    : course.instructor;

                return (
                  <tr
                    key={course.id}
                    className="border-b border-gray-100 dark:border-gray-900"
                    onMouseEnter={() => {
                      if (!coachesMap[course.id]) {
                        void loadCourseCoaches(course.id);
                      }
                    }}
                  >
                    <td className="px-2 py-3 text-gray-900 dark:text-white">{course.title}</td>
                    <td className="px-2 py-3 text-gray-600 dark:text-gray-300">
                      {course.schedule.day} · {course.schedule.time}
                    </td>
                    <td className="px-2 py-3 text-gray-600 dark:text-gray-300">{displayCoaches}</td>
                    <td className="px-2 py-3 text-gray-600 dark:text-gray-300">{formatAvailability(course)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </DashboardSection>
  );
}

export function DashboardClientsPage() {
  const [clients, setClients] = useState<DashboardClient[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const token = readStoredToken();

  const [selectedClient, setSelectedClient] = useState<DashboardClient | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");

  useEffect(() => {
    let isMounted = true;

    const loadClients = async () => {
      try {
        if (!token) throw new Error("Session invalide.");

        const [clientsResponse, coursesResponse] = await Promise.all([
          getDashboardClients(token),
          getCourses(),
        ]);

        if (isMounted) {
          setClients(clientsResponse.clients);
          setCourses(coursesResponse.courses);
          setError("");
        }
      } catch (loadError) {
        if (isMounted) {
          const message = loadError instanceof Error ? loadError.message : "Impossible de charger la liste des clients.";
          setError(message);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void loadClients();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleOpenAddCoach = (client: DashboardClient) => {
    setSelectedClient(client);
    setSelectedCourseId("");
    setError("");
    setSuccess("");
  };

  const handleCloseAddCoach = () => {
    setSelectedClient(null);
    setSelectedCourseId("");
  };

  const handleAddCoach = async () => {
    if (!token || !selectedClient || !selectedCourseId) return;

    setError("");
    setSuccess("");

    try {
      await addCoachToCourse(token, selectedCourseId, selectedClient.id);
      setSuccess("Coach ajouté avec succès au cours.");
      handleCloseAddCoach();
    } catch (addError) {
      const message = addError instanceof Error ? addError.message : "Impossible d'ajouter le coach.";
      setError(message);
    }
  };

  return (
    <DashboardSection
      title="Clients inscrits"
      subtitle="Vue administrateur des informations completes des clients."
    >
      {isLoading ? (
        <p className="text-sm text-gray-600 dark:text-gray-300">Chargement des clients...</p>
      ) : null}
      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      ) : null}
      {success ? (
        <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{success}</p>
      ) : null}

      {!isLoading && !error && clients.length === 0 ? (
        <p className="text-sm text-gray-600 dark:text-gray-300">Aucun client inscrit pour le moment.</p>
      ) : null}

      {!isLoading && !error && clients.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-325 text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                <th className="px-2 py-3 font-medium">Nom</th>
                <th className="px-2 py-3 font-medium">Email</th>
                <th className="px-2 py-3 font-medium">Telephone</th>
                <th className="px-2 py-3 font-medium">Date naissance</th>
                <th className="px-2 py-3 font-medium">Adresse</th>
                <th className="px-2 py-3 font-medium">Ville</th>
                <th className="px-2 py-3 font-medium">Pays</th>
                <th className="px-2 py-3 font-medium">Inscription</th>
                <th className="px-2 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="group relative border-b border-gray-100 dark:border-gray-900">
                  <td className="px-2 py-3 text-gray-900 dark:text-white">{client.name || "-"}</td>
                  <td className="px-2 py-3 text-gray-600 dark:text-gray-300">{client.email || "-"}</td>
                  <td className="px-2 py-3 text-gray-600 dark:text-gray-300">{client.phone || "-"}</td>
                  <td className="px-2 py-3 text-gray-600 dark:text-gray-300">{client.birthDate || "-"}</td>
                  <td className="px-2 py-3 text-gray-600 dark:text-gray-300">{client.address || "-"}</td>
                  <td className="px-2 py-3 text-gray-600 dark:text-gray-300">{client.city || "-"}</td>
                  <td className="px-2 py-3 text-gray-600 dark:text-gray-300">{client.country || "-"}</td>
                  <td className="px-2 py-3 text-gray-600 dark:text-gray-300">{formatDate(client.createdAt)}</td>
                  <td className="px-2 py-3">
                    <button
                      type="button"
                      onClick={() => handleOpenAddCoach(client)}
                      className="rounded-md bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      Ajouter comme coach
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {selectedClient ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Ajouter {selectedClient.name} comme coach
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Choisissez le cours auquel vous souhaitez l assigner.
            </p>
            <label className="mt-4 grid gap-1 text-sm text-gray-600 dark:text-gray-300">
              Cours
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              >
                <option value="">-- Choisir un cours --</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </label>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseAddCoach}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-400 dark:border-gray-700 dark:text-gray-300"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleAddCoach}
                disabled={!selectedCourseId}
                className="rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </DashboardSection>
  );
}

export function DashboardUserProfilePage() {
  const token = readStoredToken();
  const [user, setUser] = useState<AuthUser | null>(() => readCurrentUser());
  const [form, setForm] = useState<UpdateProfilePayload>(() => createProfileForm(readCurrentUser()));
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      if (!token) {
        setIsLoading(false);
        setError("Session invalide.");
        return;
      }

      try {
        const response = await getCurrentUser(token);
        if (isMounted) {
          setUser(response.user);
          setForm(createProfileForm(response.user));
          persistAuth(token, response.user);
          setError("");
        }
      } catch (loadError) {
        if (isMounted) {
          const message = loadError instanceof Error ? loadError.message : "Impossible de charger le profil.";
          setError(message);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleFieldChange = (field: keyof UpdateProfilePayload, value: string) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("Session invalide.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await updateCurrentUser(token, form);
      setUser(response.user);
      setForm(createProfileForm(response.user));
      persistAuth(token, response.user);
      setSuccess("Informations personnelles mises a jour.");
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : "Impossible d'enregistrer les modifications.";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardSection title="User Profile" subtitle="Informations du compte connecte.">
      <section className="rounded-xl border border-gray-200 p-5 dark:border-gray-800">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Profil actuel</h3>
        {isLoading ? (
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">Chargement du profil...</p>
        ) : null}
        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="text-gray-500 dark:text-gray-400">Nom</dt>
            <dd className="text-gray-900 dark:text-gray-200">{user?.name ?? "Non renseigne"}</dd>
          </div>
          <div>
            <dt className="text-gray-500 dark:text-gray-400">Email</dt>
            <dd className="text-gray-900 dark:text-gray-200">{user?.email ?? "Non renseigne"}</dd>
          </div>
          <div>
            <dt className="text-gray-500 dark:text-gray-400">ID utilisateur</dt>
            <dd className="break-all text-gray-900 dark:text-gray-200">{user?.id ?? "Non disponible"}</dd>
          </div>
          <div>
            <dt className="text-gray-500 dark:text-gray-400">Role</dt>
            <dd className="text-gray-900 capitalize dark:text-gray-200">{user?.role ?? "client"}</dd>
          </div>
        </dl>
      </section>
      <section className="mt-6 rounded-xl border border-gray-200 p-5 dark:border-gray-800">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Modifier mes informations</h3>
        <form onSubmit={saveProfile} className="mt-4 grid gap-3">
          <label className="grid gap-1 text-sm text-gray-600 dark:text-gray-300">
            Nom complet
            <input
              type="text"
              value={form.name}
              onChange={(event) => handleFieldChange("name", event.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              required
            />
          </label>
          <label className="grid gap-1 text-sm text-gray-600 dark:text-gray-300">
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) => handleFieldChange("email", event.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              required
            />
          </label>
          <label className="grid gap-1 text-sm text-gray-600 dark:text-gray-300">
            Telephone
            <input
              type="tel"
              value={form.phone}
              onChange={(event) => handleFieldChange("phone", event.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              required
            />
          </label>
          <label className="grid gap-1 text-sm text-gray-600 dark:text-gray-300">
            Date de naissance
            <input
              type="date"
              value={form.birthDate}
              onChange={(event) => handleFieldChange("birthDate", event.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              required
            />
          </label>
          <label className="grid gap-1 text-sm text-gray-600 dark:text-gray-300">
            Adresse
            <input
              type="text"
              value={form.address}
              onChange={(event) => handleFieldChange("address", event.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              required
            />
          </label>
          <label className="grid gap-1 text-sm text-gray-600 dark:text-gray-300">
            Ville
            <input
              type="text"
              value={form.city}
              onChange={(event) => handleFieldChange("city", event.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              required
            />
          </label>
          <label className="grid gap-1 text-sm text-gray-600 dark:text-gray-300">
            Pays
            <input
              type="text"
              value={form.country}
              onChange={(event) => handleFieldChange("country", event.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              required
            />
          </label>

          {error ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          ) : null}
          {success ? (
            <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{success}</p>
          ) : null}

          <button
            type="submit"
            disabled={isSaving}
            className="mt-1 w-full rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
        </form>
      </section>
    </DashboardSection>
  );
}

export function DashboardAccountPage() {
  return (
    <DashboardSection title="Account" subtitle="Parametres de securite et acces.">
      <section className="rounded-xl border border-gray-200 p-5 dark:border-gray-800">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Securite</h3>
        <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
          <li>Mot de passe: minimum 6 caracteres.</li>
          <li>Session en cours: stockage local du token utilisateur.</li>
          <li>Reinitialisation: disponible depuis la page "Mot de passe oublie".</li>
        </ul>
      </section>
      <section className="mt-6 rounded-xl border border-gray-200 p-5 dark:border-gray-800">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Actions rapides</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-md border border-gray-200 px-3 py-1.5 text-xs text-gray-600 dark:border-gray-700 dark:text-gray-300">
            Mise a jour du profil
          </span>
          <span className="rounded-md border border-gray-200 px-3 py-1.5 text-xs text-gray-600 dark:border-gray-700 dark:text-gray-300">
            Gestion des sessions
          </span>
          <span className="rounded-md border border-gray-200 px-3 py-1.5 text-xs text-gray-600 dark:border-gray-700 dark:text-gray-300">
            Historique de connexion
          </span>
        </div>
      </section>
    </DashboardSection>
  );
}

export function DashboardCorporatePage() {
  const programs = [
    { name: "Pack Team Building", members: "10-30", frequency: "2x / semaine" },
    { name: "Pack Performance", members: "30-80", frequency: "3x / semaine" },
    { name: "Pack Premium", members: "80+", frequency: "Sur mesure" },
  ];

  return (
    <DashboardSection title="Corporate" subtitle="Offres entreprises et suivi des programmes.">
      <section className="rounded-xl border border-gray-200 p-5 dark:border-gray-800 xl:col-span-2">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Programmes</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {programs.map((program) => (
            <article key={program.name} className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{program.name}</h4>
              <p className="mt-2 text-xs text-gray-600 dark:text-gray-300">Membres: {program.members}</p>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">Frequence: {program.frequency}</p>
            </article>
          ))}
        </div>
      </section>
    </DashboardSection>
  );
}

export function DashboardBlogPage() {
  const posts = [
    { title: "5 routines matinales pour rester en forme", category: "Conseils", date: "02 May 2026" },
    { title: "Nutrition avant entrainement: guide rapide", category: "Nutrition", date: "30 Apr 2026" },
    { title: "Recuperation active: eviter les blessures", category: "Sante", date: "22 Apr 2026" },
  ];

  return (
    <DashboardSection title="Blog" subtitle="Contenu editorial et publications recentes.">
      <section className="rounded-xl border border-gray-200 p-5 dark:border-gray-800 xl:col-span-2">
        <div className="space-y-4">
          {posts.map((post) => (
            <article key={post.title} className="rounded-lg border border-gray-200 px-4 py-3 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{post.title}</h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {post.category} - {post.date}
              </p>
            </article>
          ))}
        </div>
      </section>
    </DashboardSection>
  );
}

export function DashboardSocialPage() {
  const messages = [
    {
      platform: "Instagram",
      summary: "12 nouveaux commentaires",
      status: "A traiter",
      href: "https://www.instagram.com/fitclub",
    },
    { platform: "Facebook", summary: "3 messages prives", status: "Nouveau", href: "https://www.facebook.com/fitclub" },
    { platform: "WhatsApp", summary: "8 demandes d'inscription", status: "Urgent", href: "https://wa.me/221775653857" },
    { platform: "TikTok", summary: "5 nouvelles videos publiees", status: "A traiter", href: "https://www.tiktok.com/@fitclub" },
    { platform: "LinkedIn", summary: "3 nouvelles offres d'emploi", status: "Nouveau", href: "https://www.linkedin.com/company/fitclub" },
  ];

  const icon = (platform: string) => {
    const src =
      platform === "WhatsApp"
        ? "/social-logos/whatsapp.svg"
        : platform === "Instagram"
          ? "/social-logos/instagram.svg"
          : platform === "Facebook"
            ? "/social-logos/facebook.png"
            : platform === "TikTok"
              ? "/social-logos/tiktok.jpg"
              : platform === "LinkedIn"
                ? "/social-logos/linkedin.png"
                : "";

    if (!src) return null;

    return <img src={src} alt={platform} className="h-6 w-6" />;
  };

  return (
    <DashboardSection title="Social" subtitle="Suivi des interactions communautaires.">
      {messages.map((message) => (
        <a
          key={message.platform}
          href={message.href}
          target="_blank"
          rel="noreferrer"
          className="rounded-xl border border-gray-200 p-5 dark:border-gray-800 transition hover:border-orange-500 hover:shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-white">{icon(message.platform)}</span>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{message.platform}</h3>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">{message.status}</span>
          </div>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">{message.summary}</p>
        </a>
      ))}
    </DashboardSection>
  );
}

export function DashboardCourseCoachesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [coachesMap, setCoachesMap] = useState<Record<string, CourseCoach[]>>({});
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const token = readStoredToken();

  useEffect(() => {
    let isMounted = true;

    const loadCourses = async () => {
      try {
        const response = await getCourses();
        if (isMounted) {
          setCourses(response.courses);
          setError("");
        }
      } catch (loadError) {
        if (isMounted) {
          const message = loadError instanceof Error ? loadError.message : "Impossible de charger les cours.";
          setError(message);
        }
      } finally {
        if (isMounted) setIsLoadingCourses(false);
      }
    };

    void loadCourses();

    return () => {
      isMounted = false;
    };
  }, []);

  const loadCourseCoaches = async (courseId: string) => {
    if (!token) {
      setError("Session invalide.");
      return;
    }

    setError("");
    setSuccess("");

    try {
      const response = await getCourseCoaches(token, courseId);
      setCoachesMap((previous) => ({ ...previous, [courseId]: response.coaches }));
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : "Impossible de charger les coachs.";
      setError(message);
    }
  };

  const handleSelectCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    if (!coachesMap[courseId]) {
      void loadCourseCoaches(courseId);
    }
  };

  const handleAddCoach = async (userId: string) => {
    if (!token || !selectedCourseId) return;

    setError("");
    setSuccess("");

    try {
      const response = await addCoachToCourse(token, selectedCourseId, userId);
      setCoachesMap((previous) => ({ ...previous, [selectedCourseId]: response.coaches }));
      setSuccess("Coach ajoute avec succes.");
    } catch (addError) {
      const message = addError instanceof Error ? addError.message : "Impossible d'ajouter le coach.";
      setError(message);
    }
  };

  const handleRemoveCoach = async (coachId: string) => {
    if (!token || !selectedCourseId) return;

    const confirmed = window.confirm("Supprimer ce coach du cours ?");
    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      const response = await removeCoachFromCourse(token, selectedCourseId, coachId);
      setCoachesMap((previous) => ({ ...previous, [selectedCourseId]: response.coaches }));
      setSuccess("Coach supprime du cours.");
    } catch (removeError) {
      const message = removeError instanceof Error ? removeError.message : "Impossible de supprimer le coach.";
      setError(message);
    }
  };

  const selectedCourse = courses.find((course) => course.id === selectedCourseId) ?? null;
  const selectedCoaches = selectedCourseId ? coachesMap[selectedCourseId] ?? [] : [];

  return (
    <DashboardSection title="Coaches par cours" subtitle="Affecter entre 1 et 5 coachs par cours.">
      {error ? (
        <p className="xl:col-span-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      ) : null}
      {success ? (
        <p className="xl:col-span-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{success}</p>
      ) : null}

      <section className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">1. Choisir un cours</h3>
        {isLoadingCourses ? (
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">Chargement des cours...</p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {courses.map((course) => (
              <button
                key={course.id}
                type="button"
                onClick={() => handleSelectCourse(course.id)}
                className={`rounded-md border px-3 py-1.5 text-xs font-semibold ${
                  selectedCourseId === course.id
                    ? "border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400"
                    : "border-gray-200 text-gray-700 hover:border-gray-300 dark:border-gray-700 dark:text-gray-300"
                }`}
              >
                {course.title}
              </button>
            ))}
          </div>
        )}
      </section>

      {selectedCourse ? (
        <section className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                2. Coachs assignes a "{selectedCourse.title}"
              </h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {selectedCourse.schedule.day} · {selectedCourse.schedule.time} · {selectedCourse.duration} min
              </p>
            </div>
            <span className="shrink-0 rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-300">
              {selectedCoaches.length}/5 (min 1)
            </span>
          </div>

          <div className="mt-4 space-y-2">
            {selectedCoaches.length > 0 ? (
              selectedCoaches.map((coach) => (
                <div
                  key={coach.id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 dark:border-gray-900"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{coach.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{coach.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCoach(coach.id)}
                    className="text-xs font-semibold text-red-600 hover:text-red-700"
                  >
                    Retirer
                  </button>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-300">Aucun coach assigne pour le moment.</p>
            )}
          </div>

          <div className="mt-4">
            <h4 className="text-xs font-semibold text-gray-700 uppercase dark:text-gray-300">Ajouter un coach</h4>
            <CoachSelector onSelect={handleAddCoach} />
          </div>
        </section>
      ) : null}
    </DashboardSection>
  );
}

type CoachSelectorProps = {
  onSelect: (userId: string) => void;
};

function CoachSelector({ onSelect }: CoachSelectorProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<CourseCoach[]>([]);
  const [status, setStatus] = useState("");

  const handleSearch = async (value: string) => {
    setQuery(value);
    if (!value.trim()) {
      setSuggestions([]);
      return;
    }

    setStatus("");

    try {
      const response = await getDashboardClients(readStoredToken() ?? "");
      const lowerQuery = value.toLowerCase();

      const matches = response.clients
        .filter((client) => client.role === "coach" || client.role === "client")
        .filter(
          (client) =>
            client.name.toLowerCase().includes(lowerQuery) || client.email.toLowerCase().includes(lowerQuery)
        )
        .map((client) => ({
          id: client.id,
          name: client.name,
          email: client.email,
          role: client.role,
        }));

      setSuggestions(matches.slice(0, 10));
    } catch {
      setSuggestions([]);
      setStatus("Recherche indisponible pour le moment.");
    }
  };

  return (
    <div className="mt-2">
      <label className="grid gap-1 text-sm text-gray-600 dark:text-gray-300">
        Rechercher un coach (nom ou email)
        <input
          type="text"
          value={query}
          onChange={(event) => handleSearch(event.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          placeholder=""
        />
      </label>
      {status ? <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{status}</p> : null}
      {suggestions.length > 0 ? (
        <ul className="mt-2 space-y-1">
          {suggestions.map((coach) => (
            <li key={coach.id}>
              <button
                type="button"
                onClick={() => {
                  onSelect(coach.id);
                  setQuery("");
                  setSuggestions([]);
                }}
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-left text-sm hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
              >
                <span className="font-medium text-gray-900 dark:text-white">{coach.name}</span>
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">{coach.email}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function DashboardNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const token = readStoredToken();

  useEffect(() => {
    let isMounted = true;

    const loadNotifications = async () => {
      if (!token) {
        setIsLoading(false);
        setError("Session invalide.");
        return;
      }

      try {
        const response = await getNotifications(token);
        if (isMounted) {
          setNotifications(response.notifications);
          setError("");
        }
      } catch (loadError) {
        if (isMounted) {
          const message = loadError instanceof Error ? loadError.message : "Impossible de charger les notifications.";
          setError(message);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void loadNotifications();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleMarkAsRead = async (notificationId: string) => {
    if (!token) return;

    try {
      await markNotificationAsRead(token, notificationId);
      setNotifications((prev) => prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n)));
    } catch (err) {
      console.error("Erreur marquage notification", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!token) return;

    try {
      await markAllNotificationsAsRead(token);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setSuccess("Toutes les notifications ont été marquées comme lues.");
    } catch {
      setError("Impossible de marquer toutes les notifications comme lues.");
    }
  };

  const handleDelete = async (notificationId: string) => {
    if (!token) return;

    const confirmed = window.confirm("Supprimer cette notification ?");
    if (!confirmed) return;

    try {
      await deleteNotification(token, notificationId);
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
    } catch {
      setError("Impossible de supprimer la notification.");
    }
  };

  return (
    <DashboardSection title="Notifications" subtitle="Vos alertes et messages du systeme.">
      {error ? (
        <p className="xl:col-span-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      ) : null}
      {success ? (
        <p className="xl:col-span-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{success}</p>
      ) : null}

      <div className="xl:col-span-2">
        {isLoading ? (
          <p className="text-sm text-gray-600 dark:text-gray-300">Chargement des notifications...</p>
        ) : notifications.length === 0 ? (
          <p className="text-sm text-gray-600 dark:text-gray-300">Aucune notification pour le moment.</p>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`flex items-start justify-between rounded-lg border p-4 ${
                  notification.read
                    ? "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
                    : "border-orange-200 bg-orange-50 dark:border-orange-700 dark:bg-orange-900/20"
                }`}
              >
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{notification.title}</h4>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">{notification.message}</p>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {new Date(notification.createdAt).toLocaleString("fr-FR")}
                  </p>
                </div>
                <div className="ml-3 flex items-center gap-2">
                  {!notification.read ? (
                    <button
                      type="button"
                      onClick={() => handleMarkAsRead(notification._id)}
                      className="text-xs font-semibold text-orange-600 hover:text-orange-700"
                    >
                      Marquer comme lue
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => handleDelete(notification._id)}
                    className="text-xs font-semibold text-red-600 hover:text-red-700"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
            {notifications.some((n) => !n.read) ? (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-gray-400 dark:border-gray-700 dark:text-gray-300"
                >
                  Marquer tout comme lu
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </DashboardSection>
  );
}

