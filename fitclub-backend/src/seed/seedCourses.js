// Ce script insère les 6 cours affichés sur la page "Cours" du frontend,
// ainsi qu'un vrai compte coach par cours (role: "coach") auquel chaque
// cours est désormais lié via coachId (et non plus une simple chaîne de texte).
//
// Les identifiants de cours (_id) sont volontairement fixes : "course_1" à
// "course_6", car src/lib/courses.ts, dans le frontend, fait déjà
// correspondre chaque slug de cours ("base-endurance", "base-hiit", ...) à
// ces IDs précis.
//
// Mot de passe de test pour tous les comptes coach créés : Coach123!
// (à communiquer aux coachs pour leur première connexion, ou à faire
// changer via PATCH /api/coaches/:id une fois connecté)
//
// Utilisation : npm run seed  (nécessite MONGO_URI dans .env)

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Course = require('../models/Course');
const User = require('../models/User');

const COACH_DEFAULT_PASSWORD = 'Coach123!';

const coaches = [
  { name: 'Coach Awa', email: 'awa.coach@fitclub.sn', specialty: 'Endurance & cardio' },
  { name: 'Coach Idriss', email: 'idriss.coach@fitclub.sn', specialty: 'HIIT' },
  { name: 'Coach Mame', email: 'mame.coach@fitclub.sn', specialty: 'Renforcement musculaire' },
  { name: 'Coach Fatou', email: 'fatou.coach@fitclub.sn', specialty: 'Souplesse & mobilité' },
  { name: 'Coach Moussa', email: 'moussa.coach@fitclub.sn', specialty: 'Cardio' },
  { name: 'Coach Aida', email: 'aida.coach@fitclub.sn', specialty: 'Respiration & récupération' },
];

const courses = [
  {
    _id: 'course_1',
    title: 'Base Endurance',
    description: 'Un cours cardio intense pour améliorer votre souffle et votre résistance.',
    duration: 60,
    coachEmail: 'awa.coach@fitclub.sn',
    schedule: { day: 'Lundi', time: '08:00 - 09:00' },
    capacity: 12,
  },
  {
    _id: 'course_2',
    title: 'Base HIIT',
    description: "Des séquences courtes et explosives pour brûler un maximum d'énergie.",
    duration: 45,
    coachEmail: 'idriss.coach@fitclub.sn',
    schedule: { day: 'Mardi', time: '10:30 - 11:15' },
    capacity: 15,
  },
  {
    _id: 'course_3',
    title: 'Base Force',
    description: 'Un travail progressif de force pour tonifier tout le corps.',
    duration: 60,
    coachEmail: 'mame.coach@fitclub.sn',
    schedule: { day: 'Mercredi', time: '18:00 - 19:00' },
    capacity: 10,
  },
  {
    _id: 'course_4',
    title: 'Souplesse',
    description: "Des exercices de mobilité et d'étirements pour garder un corps souple.",
    duration: 45,
    coachEmail: 'fatou.coach@fitclub.sn',
    schedule: { day: 'Jeudi', time: '19:15 - 20:00' },
    capacity: 12,
  },
  {
    _id: 'course_5',
    title: 'Cardio',
    description: 'Un entraînement rythmé pour stimuler le cœur et augmenter l\'endurance.',
    duration: 45,
    coachEmail: 'moussa.coach@fitclub.sn',
    schedule: { day: 'Vendredi', time: '07:30 - 08:15' },
    capacity: 15,
  },
  {
    _id: 'course_6',
    title: 'Souffle',
    description: "Un cours centré sur la respiration pour mieux gérer l'effort et récupérer.",
    duration: 30,
    coachEmail: 'aida.coach@fitclub.sn',
    schedule: { day: 'Samedi', time: '09:00 - 09:30' },
    capacity: 10,
  },
];

const run = async () => {
  await connectDB();

  // 1. Créer (ou récupérer) chaque compte coach
  const coachIdByEmail = {};
  for (const coachData of coaches) {
    let coach = await User.findOne({ email: coachData.email });
    if (!coach) {
      coach = await User.create({
        name: coachData.name,
        email: coachData.email,
        password: COACH_DEFAULT_PASSWORD,
        role: 'coach',
        specialty: coachData.specialty,
      });
      console.log(`✔ Compte coach créé : ${coach.name} (${coach.email})`);
    } else {
      console.log(`↷ Compte coach déjà existant : ${coach.name} (${coach.email})`);
    }
    coachIdByEmail[coachData.email] = coach._id;
  }

  // 2. Créer/mettre à jour les cours, liés au bon coach
  for (const { coachEmail, ...course } of courses) {
    await Course.findByIdAndUpdate(
      course._id,
      { ...course, coaches: [coachIdByEmail[coachEmail]] },
      { upsert: true, new: true }
    );
    console.log(`✔ Cours seedé : ${course.title} (${course._id})`);
  }

  console.log('\nSeed terminé.');
  console.log(`Mot de passe des comptes coach créés : ${COACH_DEFAULT_PASSWORD}`);
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((error) => {
  console.error('Erreur pendant le seed :', error);
  process.exit(1);
});
