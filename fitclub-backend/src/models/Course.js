const mongoose = require('mongoose');

// Important : les identifiants sont des chaînes fixes ("course_1", "course_2", ...)
// car le frontend fait déjà correspondre ses slugs (ex: "base-endurance") à ces IDs
// dans src/lib/courses.ts (COURSES_MAPPING). Voir src/seed/seedCourses.js.
const courseSchema = new mongoose.Schema(
  {
    _id: { type: String },
    title: {
      type: String,
      required: [true, 'Le titre est requis'],
    },
    description: {
      type: String,
      required: [true, 'La description est requise'],
    },
    duration: {
      type: Number, // en minutes
      required: true,
      default: 45,
    },
    // Un cours peut avoir PLUSIEURS coachs (entre 4 et 5, gérés depuis le
    // dashboard admin "Coaches par cours"). Chaque entrée référence un vrai
    // compte utilisateur. Le champ `instructor` (attendu par le frontend
    // comme une simple chaîne) est reconstruit dynamiquement à partir des
    // noms de ces comptes dans courseController.js.
    coaches: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      default: [],
    },
    schedule: {
      day: { type: String, required: true },
      time: { type: String, required: true },
    },
    capacity: {
      type: Number, // nombre total de places pour ce cours
      required: true,
      default: 12,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model('Course', courseSchema);
