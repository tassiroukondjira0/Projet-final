# 📚 Guide du Système de Réservation et Paiement

## Vue d'ensemble
Système complet de réservation de cours avec paiement intégré pour la plateforme FitClub.

## 🎯 Fonctionnalités

### 1. **Authentification requise**
- Les utilisateurs doivent être connectés pour réserver un cours
- Si non connecté → redirection vers la page de login

### 2. **Réservation de cours**
- 6 cours disponibles:
  - Base Endurance (60 min)
  - Base HIIT (45 min)
  - Base Force (60 min)
  - Souplesse (50 min)
  - Cardio (55 min)
  - Souffle (45 min)

### 3. **Options d'abonnement**
| Type | Tarif | Accès |
|------|-------|-------|
| Par séance | 2000 FCFA | Une session unique |
| Mensuel | 45000 FCFA | Illimité pendant 1 mois |
| Annuel | 520000 FCFA | Illimité pendant 1 an |

### 4. **Méthodes de paiement**
- ✅ Wave (nécessite numéro de téléphone)
- ✅ Orange Money (nécessite numéro de téléphone)
- ✅ Carte bancaire

## 🚀 Flux utilisateur

### Étape 1: Parcourir les cours
- Visitez la page "Cours"
- Sélectionnez un cours et cliquez sur "Réserver"
- Vous serez redirigé vers la page de réservation

### Étape 2: Sélectionner l'abonnement
- Choisissez entre: Par séance, Mensuel, Annuel
- Consultez le prix total (FCFA)
- Cliquez sur "Procéder au paiement"

### Étape 3: Payer
- Sélectionnez la méthode de paiement
- Si Wave/Orange Money: entrez votre numéro de téléphone
- Cliquez sur "Confirmer le paiement"
- Réception de la confirmation

### Étape 4: Consulter les réservations
- Accédez au dashboard (menu latéral)
- Cliquez sur "Bookings"
- Consultez l'historique de vos réservations et paiements

## 📡 Routes API

### Courses
- `GET /api/courses` → Liste tous les cours
- `GET /api/courses/:courseId` → Détails d'un cours

### Bookings (Authentifié)
- `POST /api/bookings` → Créer une réservation
- `GET /api/bookings/me` → Mes réservations

### Payments (Authentifié)
- `POST /api/payments/process` → Traiter le paiement
- `GET /api/payments/:paymentId` → Statut du paiement

## 🔌 Types TypeScript

### Course
```typescript
type Course = {
  id: string;
  title: string;
  description: string;
  duration: number;
  instructor: string;
  schedule: {
    day: string;
    time: string;
  };
};
```

### Booking
```typescript
type Booking = {
  id: string;
  userId: string;
  courseId: string;
  subscriptionType: "session" | "monthly" | "annual";
  amount: number;
  paymentStatus: "pending" | "completed" | "failed";
  paymentMethod?: "wave" | "orange_money" | "card";
  paymentId?: string;
  createdAt: string;
};
```

## 💾 Structure base de données

```json
{
  "users": [...],
  "sessions": [...],
  "courses": [6 cours],
  "bookings": [réservations de l'utilisateur],
  "payments": [historique des paiements],
  "dashboard": {...}
}
```

## 🔐 Sécurité

- ✅ Authentification JWT requise pour les réservations
- ✅ Les réservations sont filtrées par userId
- ✅ Vérification du token sur les routes protégées
- ✅ Validation des données de paiement

## 🛠️ Déploiement

### Frontend
- URL: `http://localhost:4100` (développement)
- Route de booking: `/booking/:courseId`
- Route dashboard: `/page-dashboard/bookings`

### Backend
- URL: `http://localhost:4100` (développement)
- Port configuré dans `backend/src/config.js`

## 📝 Notes de développement

- Les paiements sont actuellement simulés (toujours réussis)
- Pour la production: intégrer les APIs Wave, Orange Money, Stripe
- Les emails de confirmation ne sont pas encore implémentés
- Les remboursements doivent être gérés manuellement

## 🎨 Pages créées

| Page | Chemin | Description |
|------|--------|-------------|
| Réservation | `/booking/:courseId` | Formulaire de réservation et paiement |
| Mes réservations | `/page-dashboard/bookings` | Historique des réservations |

