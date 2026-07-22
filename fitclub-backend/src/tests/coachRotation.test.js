const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Course = require('../models/Course');
const User = require('../models/User');
const Booking = require('../models/Booking');

const runTest = async () => {
  await connectDB();

  // Nettoyer les collections de test
  await Booking.deleteMany({});
  await Course.deleteMany({});
  await User.deleteMany({ email: /test-coach/ });

  // Créer 3 coachs de test
  const coach1 = await User.create({
    name: 'Coach Test 1',
    email: 'test-coach-1@example.com',
    password: 'password123',
    role: 'coach',
  });

  const coach2 = await User.create({
    name: 'Coach Test 2',
    email: 'test-coach-2@example.com',
    password: 'password123',
    role: 'coach',
  });

  const coach3 = await User.create({
    name: 'Coach Test 3',
    email: 'test-coach-3@example.com',
    password: 'password123',
    role: 'coach',
  });

  // Créer un cours de test avec les 3 coachs
  const course = await Course.create({
    _id: 'test_course_1',
    title: 'Test Course',
    description: 'Cours de test pour alternance',
    duration: 45,
    instructor: 'Test Instructor',
    schedule: { day: 'Lundi', time: '10:00 - 11:00' },
    capacity: 12,
    coaches: [coach1._id, coach2._id, coach3._id],
  });

  // Simuler la logique d'alternance
  const mockUser = { _id: new mongoose.Types.ObjectId() };

  const createTestBooking = async () => {
    const previousBookings = await Booking.find({ courseId: course._id })
      .sort('createdAt')
      .populate('assignedCoach');

    const coachAssignments = course.coaches.map((coach) => ({
      coach,
      count: previousBookings.filter((b) => b.assignedCoach && b.assignedCoach._id.toString() === coach._id.toString()).length,
    }));

    coachAssignments.sort((a, b) => {
      if (a.count !== b.count) return a.count - b.count;
      return a.coach._id.toString().localeCompare(b.coach._id.toString());
    });

    const selectedCoach = coachAssignments[0].coach;

    const booking = await Booking.create({
      userId: mockUser._id,
      courseId: course._id,
      subscriptionType: 'session',
      amount: 1500,
      paymentStatus: 'completed',
      assignedCoach: selectedCoach._id,
    });

    return booking;
  };

  // Créer 6 réservations pour tester l'alternance
  const bookings = [];
  for (let i = 0; i < 6; i++) {
    const booking = await createTestBooking();
    bookings.push(booking);
  }

  // Vérifier l'alternance
  const assignedCoaches = bookings.map((b) => b.assignedCoach.toString());
  console.log('\n=== Résultats de l\'alternance ===');
  console.log('Coach assignés dans l\'ordre:');
  assignedCoaches.forEach((coachId, index) => {
    const coach = [coach1, coach2, coach3].find((c) => c._id.toString() === coachId);
    console.log(`  Réservation ${index + 1}: ${coach ? coach.name : coachId}`);
  });

  // Compter les assignations
  const coach1Count = assignedCoaches.filter((id) => id === coach1._id.toString()).length;
  const coach2Count = assignedCoaches.filter((id) => id === coach2._id.toString()).length;
  const coach3Count = assignedCoaches.filter((id) => id === coach3._id.toString()).length;

  console.log('\n=== Statistiques ===');
  console.log(`Coach 1: ${coach1Count} réservation(s)`);
  console.log(`Coach 2: ${coach2Count} réservation(s)`);
  console.log(`Coach 3: ${coach3Count} réservation(s)`);

  // Vérifier que l'alternance est équilibrée
  const isBalanced = coach1Count === coach2Count && coach2Count === coach3Count;
  console.log(`\nAlternance équilibrée: ${isBalanced ? '✓ OUI' : '✗ NON'}`);

  if (!isBalanced) {
    console.error('\n❌ ÉCHEC: L\'alternance n\'est pas équilibrée');
    process.exit(1);
  }

  console.log('\n✅ SUCCÈS: L\'alternance automatique fonctionne correctement');
  await mongoose.disconnect();
  process.exit(0);
};

runTest().catch((error) => {
  console.error('Erreur pendant le test:', error);
  process.exit(1);
});