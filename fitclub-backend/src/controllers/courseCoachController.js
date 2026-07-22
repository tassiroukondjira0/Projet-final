const Course = require('../models/Course');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { authorize } = require('../middleware/authMiddleware');

// @desc    Obtenir les coachs d'un cours
// @route   GET /api/courses/:courseId/coaches
// @access  Admin
const getCourseCoaches = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId).populate('coaches', 'name email role createdAt');
    
    if (!course) {
      return res.status(404).json({ message: 'Cours introuvable' });
    }

    // Formatage simple pour le frontend
    const coaches = course.coaches.map(coach => ({
      id: coach._id,
      name: coach.name,
      email: coach.email,
      role: coach.role,
    }));

    res.json({ 
      coaches,
      count: coaches.length,
      maxCoaches: 5,
      minCoaches: 1,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Ajouter un coach à un cours
// @route   POST /api/courses/:courseId/coaches
// @access  Admin
// @body    { userId: "coach_id" }
const addCoachToCourse = async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'L\'ID du coach est requis' });
    }

    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Cours introuvable' });
    }

    // Vérifier le nombre max de coachs (5 max)
    if (course.coaches.length >= 5) {
      return res.status(400).json({ 
        message: 'Ce cours a déjà atteint le nombre maximum de coachs (5)' 
      });
    }

    // Vérifier que l'utilisateur existe et a le rôle coach
    const coach = await User.findById(userId);
    if (!coach) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    if (!['coach', 'client'].includes(coach.role)) {
      return res.status(400).json({ message: 'L\'utilisateur doit être un client ou un coach inscrit' });
    }

    // Vérifier que le coach n'est pas déjà assigné à ce cours
    if (course.coaches.includes(userId)) {
      return res.status(400).json({ message: 'Ce coach est déjà assigné à ce cours' });
    }

    course.coaches.push(userId);
    
    // Mettre à jour le rôle de l'utilisateur en "coach"
    coach.role = 'coach';
    await coach.save();
    
    await course.save();

    // Créer une notification pour le nouveau coach
    await Notification.create({
      userId: userId,
      type: 'coach_assignment',
      title: 'Félicitations ! Vous êtes maintenant coach',
      message: `Vous avez été nommé coach pour le cours "${course.title}". Vous pouvez maintenant consulter vos cours dans le dashboard.`,
      data: {
        courseId: course._id,
        courseTitle: course.title,
      },
    });

    // Retourner le cours avec les coachs peuplés
    const updatedCourse = await Course.findById(course._id).populate('coaches', 'name email role createdAt');

    const coaches = updatedCourse.coaches.map(coach => ({
      id: coach._id,
      name: coach.name,
      email: coach.email,
      role: coach.role,
    }));

    res.status(200).json({
      message: 'Coach ajouté avec succès',
      course: updatedCourse,
      coaches,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Supprimer un coach d'un cours
// @route   DELETE /api/courses/:courseId/coaches/:coachId
// @access  Admin
const removeCoachFromCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Cours introuvable' });
    }

    const coachId = req.params.coachId;

    // Vérifier que le coach est bien dans la liste
    if (!course.coaches.includes(coachId)) {
      return res.status(404).json({ message: 'Ce coach n\'est pas assigné à ce cours' });
    }

    // Vérifier le nombre min de coachs (4 min)
    if (course.coaches.length <= 4) {
      return res.status(400).json({ 
        message: 'Un cours doit avoir au minimum 4 coachs. Impossible de supprimer.' 
      });
    }

    // Retirer le coach
    course.coaches = course.coaches.filter(id => id.toString() !== coachId);
    await course.save();

    // Retourner le cours mis à jour
    const updatedCourse = await Course.findById(course._id).populate('coaches', 'name email role createdAt');

    const coaches = updatedCourse.coaches.map(coach => ({
      id: coach._id,
      name: coach.name,
      email: coach.email,
      role: coach.role,
    }));

    res.json({
      message: 'Coach supprimé avec succès',
      course: updatedCourse,
      coaches,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCourseCoaches,
  addCoachToCourse,
  removeCoachFromCourse,
};