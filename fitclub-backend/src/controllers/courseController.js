const Course = require('../models/Course');
const Booking = require('../models/Booking');
const User = require('../models/User');

const MAX_COACHES_PER_COURSE = 5;

// Une réservation "pending" ou "completed" occupe une place ; seule une
// réservation "failed" (paiement échoué) libère la place.
const BOOKED_STATUSES = ['pending', 'completed'];

// Ajoute availableSpots + reconstruit `instructor` (chaîne, pour compat
// frontend) à partir des comptes coach liés au cours (course.coaches).
const withAvailability = async (course) => {
  const bookedCount = await Booking.countDocuments({
    courseId: course._id,
    paymentStatus: { $in: BOOKED_STATUSES },
  });
  const json = course.toJSON();
  json.availableSpots = Math.max(course.capacity - bookedCount, 0);

  const coaches = Array.isArray(course.coaches) ? course.coaches : [];
  const populatedCoaches = coaches.filter((c) => c && typeof c === 'object' && c.name);
  json.instructor = populatedCoaches.length > 0 ? populatedCoaches.map((c) => c.name).join(', ') : '';
  json.coaches = populatedCoaches.map((c) => ({
    id: (c._id ?? c.id).toString(),
    name: c.name,
    email: c.email,
    role: c.role,
  }));

  return json;
};

// @desc    Liste des cours
// @route   GET /api/courses
// @access  Public
const getCourses = async (req, res, next) => {
  try {
    const courses = await Course.find().sort('_id').populate('coaches', 'name email role');
    const withSpots = await Promise.all(courses.map(withAvailability));
    res.json({ courses: withSpots });
  } catch (error) {
    next(error);
  }
};

// @desc    Détail d'un cours
// @route   GET /api/courses/:id
// @access  Public
const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id).populate('coaches', 'name email role');
    if (!course) return res.status(404).json({ message: 'Cours introuvable' });
    res.json({ course: await withAvailability(course) });
  } catch (error) {
    next(error);
  }
};

// @desc    Cours dont le coach connecté fait partie de l'équipe
// @route   GET /api/courses/mine
// @access  Privé (coach)
const getMyCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ coaches: req.user._id }).sort('_id').populate('coaches', 'name email role');
    const withSpots = await Promise.all(courses.map(withAvailability));
    res.json({ courses: withSpots });
  } catch (error) {
    next(error);
  }
};

// @desc    Liste des coachs assignés à un cours
// @route   GET /api/courses/:courseId/coaches
// @access  Privé (admin)
const getCourseCoaches = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId).populate('coaches', 'name email role');
    if (!course) return res.status(404).json({ message: 'Cours introuvable' });

    const coaches = course.coaches.map((c) => ({
      id: c._id.toString(),
      name: c.name,
      email: c.email,
      role: c.role,
    }));
    res.json({ coaches });
  } catch (error) {
    next(error);
  }
};

// @desc    Assigner un utilisateur comme coach d'un cours
// @route   POST /api/courses/:courseId/coaches
// @access  Privé (admin)
// @body    { userId }
const addCoachToCourse = async (req, res, next) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId est requis' });

    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Cours introuvable' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });

    if (course.coaches.some((id) => id.toString() === userId)) {
      return res.status(400).json({ message: 'Ce coach est déjà assigné à ce cours' });
    }
    if (course.coaches.length >= MAX_COACHES_PER_COURSE) {
      return res.status(400).json({ message: `Ce cours a déjà atteint le maximum de ${MAX_COACHES_PER_COURSE} coachs` });
    }

    course.coaches.push(userId);
    await course.save();

    // Désigner quelqu'un comme coach d'un cours lui donne aussi le rôle
    // "coach" sur son compte (accès à l'espace coach), s'il ne l'a pas déjà.
    if (user.role === 'client') {
      user.role = 'coach';
      await user.save();
    }

    await course.populate('coaches', 'name email role');
    const coaches = course.coaches.map((c) => ({
      id: c._id.toString(),
      name: c.name,
      email: c.email,
      role: c.role,
    }));
    res.status(201).json({ coaches });
  } catch (error) {
    next(error);
  }
};

// @desc    Retirer un coach d'un cours
// @route   DELETE /api/courses/:courseId/coaches/:coachId
// @access  Privé (admin)
const removeCoachFromCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Cours introuvable' });

    course.coaches = course.coaches.filter((id) => id.toString() !== req.params.coachId);
    await course.save();

    await course.populate('coaches', 'name email role');
    const coaches = course.coaches.map((c) => ({
      id: c._id.toString(),
      name: c.name,
      email: c.email,
      role: c.role,
    }));
    res.json({ coaches });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCourses,
  getCourseById,
  getMyCourses,
  getCourseCoaches,
  addCoachToCourse,
  removeCoachFromCourse,
};
