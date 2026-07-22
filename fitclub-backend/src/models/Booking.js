const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    // Nommés userId / courseId (et non user / course) pour correspondre
    // directement au type `Booking` attendu par le frontend (src/lib/api.ts)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    courseId: {
      type: String,
      ref: 'Course',
      required: true,
    },
    subscriptionType: {
      type: String,
      enum: ['session', 'monthly', 'annual'],
      required: true,
    },
    amount: {
      type: Number,
      required: true, // calculé côté serveur à partir de PRICING, jamais fourni par le client
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['wave', 'orange_money', 'card'],
      default: undefined,
    },
    paymentId: {
      type: String,
      default: undefined,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model('Booking', bookingSchema);
