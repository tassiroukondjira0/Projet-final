const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Le nom est requis'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "L'email est requis"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Le mot de passe est requis'],
      minlength: 6,
      select: false,
    },
    // Le frontend ne connaissait jusqu'ici que "admin" et "client" ;
    // "coach" est un vrai rôle qui peut se connecter comme les autres.
    role: {
      type: String,
      enum: ['admin', 'client', 'coach'],
      default: 'client',
    },
    phone: { type: String, default: '' },
    birthDate: { type: String, default: '' }, // stocké tel quel (format date HTML)
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    country: { type: String, default: '' },
    // Champs utilisés uniquement pour les comptes coach (facultatifs sinon)
    bio: { type: String, default: '' },
    specialty: { type: String, default: '' },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
      },
    },
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
