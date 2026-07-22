# API Backend — FitClub

API REST développée avec **Express.js** et **MongoDB (Mongoose)** pour l'application de coaching
sportif FitClub (Dakar). Cette API a été conçue pour correspondre **exactement** au client déjà
présent dans le frontend (`src/lib/api.ts`, `src/lib/auth.ts`, `src/lib/courses.ts`) — aucune
modification du code frontend n'est nécessaire, il suffit de pointer `VITE_API_BASE_URL` vers
cette API déployée.

## Sommaire

- [Installation](#installation)
- [Variables d'environnement](#variables-denvironnement)
- [Architecture du projet](#architecture-du-projet)
- [Authentification](#authentification)
- [Créer un compte administrateur](#créer-un-compte-administrateur)
- [Documentation des routes](#documentation-des-routes)
- [Codes d'erreur](#codes-derreur)
- [Déploiement](#déploiement)

---

## Installation

```bash
npm install
cp .env.example .env      # renseigner MONGO_URI et JWT_SECRET
npm run seed               # crée les 6 cours attendus par la page "Cours" du frontend
npm run dev                # démarrage en développement (nodemon)
npm start                   # démarrage en production
```

Le frontend est configuré (voir son `.env`) pour appeler `http://localhost:4100/api` en local :
gardez `PORT=4100` en développement pour que tout fonctionne sans rien changer côté frontend.

## Variables d'environnement

| Variable | Description |
|---|---|
| `PORT` | Port d'écoute (4100 en local pour matcher le frontend) |
| `MONGO_URI` | URI de connexion MongoDB (Atlas recommandé) |
| `JWT_SECRET` | Clé secrète pour signer les tokens JWT |
| `JWT_EXPIRES_IN` | Durée de validité du token (ex : `7d`) |
| `CLIENT_URL` | URL du frontend déployé (pour la config CORS) |
| `NODE_ENV` | `development` ou `production` |

## Architecture du projet

```
fitclub-backend/
├── src/
│   ├── config/db.js              # Connexion MongoDB
│   ├── models/                   # User, Course, Booking, ContactMessage, AnalyticsEvent
│   ├── controllers/               # Logique métier
│   ├── routes/                    # Définition des routes
│   ├── middleware/
│   │   ├── authMiddleware.js       # JWT + rôles (admin/client)
│   │   ├── analyticsMiddleware.js  # Journalisation légère pour le dashboard
│   │   └── errorMiddleware.js
│   ├── utils/
│   │   ├── generateToken.js
│   │   └── pricing.js             # Grille tarifaire (identique au frontend)
│   ├── seed/seedCourses.js        # Peuple les 6 cours (IDs fixes course_1..course_6)
│   └── app.js
├── server.js
├── .env.example
└── package.json
```

## Authentification

JWT envoyé dans l'en-tête de chaque route privée :

```
Authorization: Bearer <token>
```

Trois rôles existent : `client` (par défaut à l'inscription), `admin`, et `coach`.

## Créer un compte administrateur ou coach

Par sécurité, **l'inscription publique (`/api/auth/register`) crée toujours un compte `client`.**
Ni un admin ni un coach ne peuvent être créés par ce biais.

**Administrateur** — après une inscription normale, promouvez le compte manuellement dans MongoDB
(Atlas → "Browse Collections", ou `mongosh`) :

```js
db.users.updateOne(
  { email: "votre-email-admin@example.com" },
  { $set: { role: "admin" } }
)
```

**Coach** — un compte coach est créé par un admin via `POST /api/coaches` (voir plus bas), avec un
mot de passe que le coach pourra changer ensuite. Le script `npm run seed` crée aussi 6 comptes
coach de démonstration (mot de passe `Coach123!`), un par cours.

Le frontend détecte le rôle admin via le champ `role` renvoyé par l'API (voir `userIsAdmin` dans
`src/lib/auth.ts`) — pas besoin de modifier le frontend pour ces changements de rôle.

---

## Documentation des routes

### Auth

| Méthode | Route | Accès | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Inscription (toujours en rôle `client`) |
| POST | `/api/auth/login` | Public | Connexion |
| POST | `/api/auth/forgot-password` | Public | Demande de réinitialisation (voir note ci-dessous) |
| GET | `/api/auth/me` | 🔒 | Profil de l'utilisateur connecté |
| PATCH | `/api/auth/me` | 🔒 | Mise à jour du profil |

**`POST /api/auth/register`** — Body :
```json
{
  "name": "Awa Diop",
  "email": "awa@example.com",
  "password": "motdepasse123",
  "phone": "+221701234567",
  "birthDate": "1995-04-12",
  "address": "Rue Mz 83",
  "city": "Dakar",
  "country": "Sénégal"
}
```
Réponse `201` :
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "64f1c2...",
    "name": "Awa Diop",
    "email": "awa@example.com",
    "role": "client",
    "phone": "+221701234567",
    "birthDate": "1995-04-12",
    "address": "Rue Mz 83",
    "city": "Dakar",
    "country": "Sénégal",
    "createdAt": "2026-07-18T10:00:00.000Z"
  }
}
```

**`POST /api/auth/login`** — Body : `{ "email": "...", "password": "..." }` → même forme de réponse.

**`POST /api/auth/forgot-password`** — Body : `{ "email": "..." }` → `{ "message": "..." }`.
⚠️ Aucun service d'envoi d'email réel n'est branché (nécessiterait un fournisseur SMTP type
Nodemailer/SendGrid). Le lien de réinitialisation est actuellement journalisé dans la console du
serveur — c'est le point d'intégration à compléter si l'envoi d'email réel est requis.

**`PATCH /api/auth/me`** — Body : `{ name, email, phone, birthDate, address, city, country }`.

---

### Dashboard

| Méthode | Route | Accès | Description |
|---|---|---|---|
| GET | `/api/dashboard/overview` | 🔒 | Statistiques (vues, inscriptions, trafic...) |
| GET | `/api/dashboard/clients` | 🔒 admin | Liste complète des clients inscrits |

Les statistiques de `/overview` sont calculées à partir des vraies données de la base
(nombre d'utilisateurs, de réservations, pays des utilisateurs, appareils utilisés pour accéder
à l'API) plutôt que d'être des valeurs inventées.

---

### Courses

| Méthode | Route | Accès | Description |
|---|---|---|---|
| GET | `/api/courses` | Public | Liste des 6 cours |
| GET | `/api/courses/:id` | Public | Détail d'un cours (`course_1` à `course_6`) |

Réponse `GET /api/courses` :
```json
{
  "courses": [
    {
      "id": "course_1",
      "title": "Base Endurance",
      "description": "Un cours cardio intense...",
      "duration": 60,
      "instructor": "Coach Awa",
      "schedule": { "day": "Lundi", "time": "08:00 - 09:00" }
    }
  ]
}
```

---

---

### Coaches

| Méthode | Route | Accès | Description |
|---|---|---|---|
| POST | `/api/coaches` | 🔒 admin | Créer un compte coach |
| GET | `/api/coaches` | 🔒 admin | Liste des coachs |
| GET | `/api/coaches/:id` | 🔒 admin, ou le coach lui-même | Détail d'un coach |
| PATCH | `/api/coaches/:id` | 🔒 admin, ou le coach lui-même | Modifier bio/téléphone/spécialité |
| DELETE | `/api/coaches/:id` | 🔒 admin | Supprimer un compte coach |

Un coach se connecte ensuite comme n'importe quel utilisateur via `POST /api/auth/login` — l'API
renvoie `role: "coach"` dans la réponse.

**`POST /api/coaches`** — Body :
```json
{
  "name": "Coach Awa",
  "email": "awa.coach@fitclub.sn",
  "password": "motdepasse123",
  "phone": "+221701234567",
  "bio": "Spécialiste endurance et cardio depuis 8 ans.",
  "specialty": "Endurance & cardio"
}
```

Chaque cours (`Course`) peut désormais avoir **plusieurs coachs** (entre 4 et 5, gérés depuis le
dashboard admin "Coaches par cours") via un tableau `coaches` (au lieu d'un seul coach). Le champ
`instructor` renvoyé au frontend reste une chaîne (les noms des coachs joints par une virgule),
donc la forme générale de `GET /api/courses` ne change pas côté frontend.

**Gestion des coachs d'un cours :**

| Méthode | Route | Accès | Description |
|---|---|---|---|
| GET | `/api/courses/:courseId/coaches` | 🔒 admin | Liste des coachs assignés à ce cours |
| POST | `/api/courses/:courseId/coaches` | 🔒 admin | Assigner un utilisateur comme coach (body : `{ userId }`) |
| DELETE | `/api/courses/:courseId/coaches/:coachId` | 🔒 admin | Retirer un coach du cours |

Maximum 5 coachs par cours (au-delà, l'API renvoie une erreur 400). Assigner un utilisateur ayant
le rôle `client` comme coach d'un cours **change automatiquement son rôle en `coach`** — il peut
ensuite se connecter et accéder à son espace coach (`GET /api/courses/mine`). Le retirer d'un
cours ne rétrograde pas son rôle automatiquement (il peut coacher d'autres cours).

`GET /api/dashboard/clients` renvoie maintenant les comptes `client` **et** `coach` (mais pas
`admin`), pour permettre au dashboard de rechercher un coach existant à assigner à un cours.

⚠️ **Si vous aviez déjà seedé votre base avant cette mise à jour** : les cours existants ont
encore l'ancien champ `coachId` (single) et pas de `coaches` (tableau). Relancez `npm run seed`
une fois ce backend redéployé pour migrer les 6 cours vers le nouveau format.

Un coach peut consulter ses propres cours via `GET /api/courses/mine`, et voir les clients
inscrits à l'un de ses cours via `GET /api/bookings/course/:courseId` (documenté dans la section
Bookings ci-dessous).

---

### Contact

| Méthode | Route | Accès | Description |
|---|---|---|---|
| POST | `/api/contact` | Public | Envoyer un message de contact |

Body : `{ "firstName", "lastName", "email", "message" }` → `{ "message": "..." }`.

---

### Bookings

| Méthode | Route | Accès | Description |
|---|---|---|---|
| POST | `/api/bookings` | 🔒 | Créer une réservation |
| GET | `/api/bookings/me` | 🔒 | Mes réservations |
| GET | `/api/bookings/course/:courseId` | 🔒 coach (propriétaire du cours), admin | Clients inscrits à ce cours |

**`POST /api/bookings`** — Body : `{ "courseId": "course_1", "subscriptionType": "monthly" }`

Le `amount` est **toujours calculé côté serveur** (jamais envoyé par le client) à partir de la
grille tarifaire (`session`: 2000 FCFA, `monthly`: 45000 FCFA, `annual`: 520000 FCFA), identique
à `PRICING` dans le frontend.

Réponse `201` :
```json
{
  "booking": {
    "id": "64f2a1...",
    "userId": "64f1c2...",
    "courseId": "course_1",
    "subscriptionType": "monthly",
    "amount": 45000,
    "paymentStatus": "pending",
    "createdAt": "2026-07-18T10:05:00.000Z"
  }
}
```

---

### Payments

| Méthode | Route | Accès | Description |
|---|---|---|---|
| POST | `/api/payments/process` | 🔒 | Traiter le paiement d'une réservation |
| GET | `/api/payments/:id` | 🔒 | Statut d'un paiement |

⚠️ **Paiement simulé.** Aucune passerelle réelle (Wave, Orange Money, carte bancaire) n'est
intégrée — cela demanderait des identifiants marchands que ce projet scolaire n'a pas. Le
paiement passe toujours à `completed` après validation des champs. `src/controllers/paymentController.js`
est le point d'intégration à modifier pour brancher une vraie passerelle plus tard.

Body `POST /api/payments/process` :
```json
{ "bookingId": "64f2a1...", "paymentMethod": "wave", "phoneNumber": "+221701234567" }
```
Réponse : `{ "payment": { "id": "PAY-...", "status": "completed" } }`.

---

## Codes d'erreur

| Code | Signification |
|---|---|
| `400` | Requête invalide (validation, champ manquant, doublon) |
| `401` | Non authentifié (token manquant / invalide / expiré) |
| `403` | Authentifié mais rôle non autorisé |
| `404` | Ressource introuvable |
| `500` | Erreur serveur |

Format : `{ "message": "Description de l'erreur" }`

---

## Déploiement

### Backend (Render ou Railway)

1. Pousser ce dépôt sur GitHub (dans le même repo que le frontend, ou un repo séparé selon votre organisation).
2. Créer un service Web sur [Render](https://render.com) ou [Railway](https://railway.app), connecté au dépôt.
3. Renseigner les variables d'environnement (`MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, `NODE_ENV=production`).
4. Build command : `npm install` — Start command : `npm start`.
5. Une fois déployé, exécuter le seed des cours une fois (ex : `npm run seed` en local en pointant
   temporairement `MONGO_URI` vers la base de production, ou via un shell Render/Railway).

### Frontend

Le frontend n'a besoin d'aucune modification de code : il suffit de mettre à jour la variable
d'environnement `VITE_API_BASE_URL` (fichier `.env` du frontend) avec l'URL du backend déployé,
par exemple :
```
VITE_API_BASE_URL=https://fitclub-backend.onrender.com/api
```
puis de redéployer le frontend.

### Base de données

Créer un cluster gratuit sur [MongoDB Atlas](https://www.mongodb.com/atlas), whitelister
`0.0.0.0/0` pour l'accès depuis Render/Railway, puis copier l'URI dans `MONGO_URI`.
