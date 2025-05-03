const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"]
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [8, "Password must be at least 8 characters long"]
  },
  role: {
    type: String,
    required: [true, "Role is required"],
    enum: {
      values: ["mentor", "mentee"],
      message: "Role must be either mentor or mentee"
    },
    lowercase: true,
    trim: true
  },

  // Profile Information
  profilePhoto: {
    type: String,
    default: "/images/default-avatar.png"
  },
  bio: {
    type: String,
    maxlength: [500, "Bio cannot exceed 500 characters"]
  },

  // Contact Information
  phone: {
    type: String,
    required: [true, "Phone number is required"],
    trim: true
  },
  address: {
    type: String,
    required: [true, "Address is required"],
    trim: true
  },

  // Professional Information
  language: {
    type: String,
    required: [true, "Language is required"],
    trim: true
  },
  qualification: {
    type: String,
    required: [true, "Qualification is required"],
    trim: true
  },

  // Mentor-specific Information
  rating: {
    type: Number,
    default: 0,
    min: [0, "Rating cannot be less than 0"],
    max: [5, "Rating cannot be more than 5"]
  },
  reviews: {
    type: Number,
    default: 0,
    min: [0, "Review count cannot be negative"]
  },
  availability: {
    type: String,
    enum: ["morning", "afternoon", "evening", "flexible"],
    default: "flexible"
  },
  price: {
    type: Number,
    default: 0,
    min: [0, "Price cannot be negative"]
  },

  // Additional Fields
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

// Method to compare password
userSchema.methods.comparePassword = function(candidatePassword) {
  return this.password === candidatePassword;
};

module.exports = mongoose.model("User", userSchema);
