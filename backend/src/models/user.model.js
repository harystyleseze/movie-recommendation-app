const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    // Profile Management Fields
    bio: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    avatar: {
      type: String,
      default: null, // URL to profile picture
    },
    location: {
      type: String,
      trim: true,
      maxlength: 100,
      default: '',
    },
    favoriteGenres: {
      type: [String],
      default: [],
    },
    isPublic: {
      type: Boolean,
      default: true, // Whether profile is publicly visible
    },
    preferences: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      publicWatchlists: {
        type: Boolean,
        default: false,
      },
      publicRatings: {
        type: Boolean,
        default: true,
      },
    },
    // Stats (calculated fields)
    stats: {
      totalMoviesRated: {
        type: Number,
        default: 0,
      },
      totalWatchlists: {
        type: Number,
        default: 0,
      },
      totalFavorites: {
        type: Number,
        default: 0,
      },
      averageRating: {
        type: Number,
        default: 0,
      },
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
