const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") ??
  (typeof window !== "undefined" ? `${window.location.origin}/api` : "/api");

type ApiErrorPayload = {
  message?: string;
};

export type UserRole = "admin" | "client" | "coach";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  birthDate: string;
  address: string;
  city: string;
  country: string;
  createdAt: string;
};

export type LoginResponse = {
  token: string;
  user: AuthUser;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  phone: string;
  birthDate: string;
  address: string;
  city: string;
  country: string;
};

export type UpdateProfilePayload = {
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  address: string;
  city: string;
  country: string;
};

export type DashboardOverview = {
  stats: Array<{
    id: string;
    title: string;
    value: number;
    change: string;
    trend: "up" | "down";
  }>;
  totalUsers: {
    labels: string[];
    thisYear: number[];
    lastYear: number[];
  };
  trafficByDevice: {
    labels: string[];
    values: number[];
  };
  trafficByLocation: {
    labels: string[];
    values: number[];
  };
};

export type DashboardClient = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  birthDate: string;
  address: string;
  city: string;
  country: string;
  createdAt: string;
};

type ApiRequestOptions = RequestInit & {
  token?: string;
};

const readPayload = async <T>(response: Response): Promise<T | ApiErrorPayload | null> => {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
};

const apiRequest = async <T>(path: string, init?: ApiRequestOptions): Promise<T> => {
  const { token, headers, ...rest } = init ?? {};

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers ?? {}),
    },
  });

  const payload = await readPayload<T>(response);

  if (!response.ok) {
    const message =
      (payload as ApiErrorPayload | null)?.message ??
      "Une erreur est survenue pendant la requete.";
    throw new Error(message);
  }

  return (payload as T) ?? ({} as T);
};

export const login = async (email: string, password: string) => {
  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
};

export const register = async (payload: RegisterPayload) => {
  return apiRequest<LoginResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const requestPasswordReset = async (email: string) => {
  return apiRequest<{ message: string }>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
};

export const getCurrentUser = async (token: string) => {
  return apiRequest<{ user: AuthUser }>("/auth/me", { token });
};

export const updateCurrentUser = async (token: string, payload: UpdateProfilePayload) => {
  return apiRequest<{ user: AuthUser }>("/auth/me", {
    method: "PATCH",
    token,
    body: JSON.stringify(payload),
  });
};

export const getDashboardOverview = async (token: string) => {
  return apiRequest<DashboardOverview>("/dashboard/overview", { token });
};

export const getDashboardClients = async (token: string) => {
  return apiRequest<{ total: number; clients: DashboardClient[] }>("/dashboard/clients", { token });
};

type ContactPayload = {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
};

export const sendContactMessage = async (payload: ContactPayload) => {
  return apiRequest<{ message: string }>("/contact", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

// Courses and Booking Types
export type SubscriptionType = "session" | "monthly" | "annual";

export type Course = {
  id: string;
  title: string;
  description: string;
  duration: number;
  instructor: string;
  schedule: {
    day: string;
    time: string;
  };
  scheduleSlots?: Array<{
    day: string;
    time: string;
  }>;
  capacity?: number;
  availableSpots?: number;
};

export const PRICING = {
  session: 2000,
  monthly: 45000,
  annual: 520000,
} as const;

export type Booking = {
  id: string;
  userId: string;
  courseId: string;
  subscriptionType: SubscriptionType;
  amount: number;
  paymentStatus: "pending" | "completed" | "failed";
  paymentMethod?: "wave" | "orange_money" | "card";
  paymentId?: string;
  createdAt: string;
};

export type BookingPayload = {
  courseId: string;
  subscriptionType: SubscriptionType;
};

export type PaymentPayload = {
  bookingId: string;
  paymentMethod: "wave" | "orange_money" | "card";
  phoneNumber?: string;
  cardDetails?: {
    number: string;
    expiry: string;
    cvv: string;
  };
};

// Course API Functions
export const getCourses = async () => {
  return apiRequest<{ courses: Course[] }>("/courses");
};

export const getCourseById = async (courseId: string) => {
  return apiRequest<{ course: Course }>(`/courses/${courseId}`);
};

// Coach info for courses
export type CourseCoach = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type CourseCoachesResponse = {
  coaches: CourseCoach[];
  count: number;
  maxCoaches: number;
  minCoaches: number;
};

// Liste des coachs assignés à un cours (admin uniquement)
export const getCourseCoaches = async (token: string, courseId: string) => {
  return apiRequest<CourseCoachesResponse>(`/courses/${courseId}/coaches`, { token });
};

// Ajouter un coach à un cours (admin uniquement)
export const addCoachToCourse = async (token: string, courseId: string, userId: string) => {
  return apiRequest<{ message: string; course: Course; coaches: CourseCoach[] }>(
    `/courses/${courseId}/coaches`,
    {
      method: "POST",
      token,
      body: JSON.stringify({ userId }),
    }
  );
};

// Supprimer un coach d'un cours (admin uniquement)
export const removeCoachFromCourse = async (token: string, courseId: string, coachId: string) => {
  return apiRequest<{ message: string; course: Course; coaches: CourseCoach[] }>(
    `/courses/${courseId}/coaches/${coachId}`,
    {
      method: "DELETE",
      token,
    }
  );
};

// Cours dont le coach connecté est responsable
export const getMyCourses = async (token: string) => {
  return apiRequest<{ courses: Course[] }>("/courses/mine", { token });
};

// Client inscrit à un cours, tel que renvoyé (populé) par /bookings/course/:courseId
export type CourseBookingClient = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

export type CourseBooking = Omit<Booking, "userId"> & {
  userId: CourseBookingClient;
};

// Liste des clients inscrits à un cours (coach propriétaire, ou admin)
export const getCourseBookings = async (token: string, courseId: string) => {
  return apiRequest<{ bookings: CourseBooking[] }>(`/bookings/course/${courseId}`, { token });
};

// Booking API Functions
export const createBooking = async (token: string, payload: BookingPayload) => {
  return apiRequest<{ booking: Booking }>("/bookings", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
};

export const getMyBookings = async (token: string) => {
  return apiRequest<{ bookings: Booking[] }>("/bookings/me", { token });
};

// Payment API Functions
export const processPayment = async (token: string, payload: PaymentPayload) => {
  return apiRequest<{ payment: { id: string; status: string; redirectUrl?: string } }>("/payments/process", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
};

export const getPaymentStatus = async (token: string, paymentId: string) => {
  return apiRequest<{ status: string; bookingId: string }>(`/payments/${paymentId}`, { token });
};

// Notifications types
export type Notification = {
  _id: string;
  userId: string;
  type: "coach_assignment" | "booking" | "payment" | "system";
  title: string;
  message: string;
  data: Record<string, unknown>;

  read: boolean;
  createdAt: string;
};

export type NotificationResponse = {
  notifications: Notification[];
  unreadCount: number;
};

// Récupérer les notifications de l'utilisateur connecté
export const getNotifications = async (token: string) => {
  return apiRequest<NotificationResponse>("/notifications", { token });
};

// Marquer une notification comme lue
export const markNotificationAsRead = async (token: string, notificationId: string) => {
  return apiRequest<{ notification: Notification }>(`/notifications/${notificationId}/read`, {
    method: "PATCH",
    token,
  });
};

// Marquer toutes les notifications comme lues
export const markAllNotificationsAsRead = async (token: string) => {
  return apiRequest<{ message: string }>("/notifications/read-all", {
    method: "PATCH",
    token,
  });
};

// Supprimer une notification
export const deleteNotification = async (token: string, notificationId: string) => {
  return apiRequest<{ message: string }>(`/notifications/${notificationId}`, {
    method: "DELETE",
    token,
  });
};
