const express = require("express");
const mongoose = require("mongoose");

const User = require("./models/user");

mongoose
  .connect(
    "mongodb+srv://fathersadvice3:QfKrVFPDDpArwvSq@fathersadvicecluster.rpgjh9d.mongodb.net/?retryWrites=true&w=majority&appName=fathersAdviceCluster",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB Atlas connection error:", err));

const path = require("path");
const app = express();

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files from "public" folder
app.use(express.static(path.join(__dirname, "public")));

// ROUTES

// Home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/html/index.html"));
});

// Find Mentor page
app.get("/find-mentor", (req, res) => {
  res.sendFile(path.join(__dirname, "public/html/find_mentor.html"));
});

// Handle form submission from "Find Mentor"
app.post("/find-mentor", (req, res) => {
  const { field, location, details } = req.body;

  console.log("Received form data:", { field, location, details });

  res.send("<h2>Thank you! Your request has been received.</h2>");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// Login page
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public/html/login.html"));
});

// Signup page
app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "public/html/signup.html"));
});

app.get("/mentor-dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public/html/mentor-dashboard.html"));
});

app.get("/mentee-dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public/html/mentee-dashboard.html"));
});

// Handle login form
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      return res
        .status(401)
        .send("<h2>User not found! Please signup first.</h2>");
    }

    if (user.password !== password) {
      return res.status(401).send("<h2>Incorrect password!</h2>");
    }

    // Role-based redirection
    if (user.role === "mentor") {
      res.redirect("/mentor-dashboard");
    } else if (user.role === "mentee") {
      res.redirect("/mentee-dashboard");
    } else {
      res.status(400).send("<h2>Invalid role detected!</h2>");
    }
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).send("<h2>Server error. Please try again later.</h2>");
  }
});

// Handle signup form
app.post("/signup", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      address,
      language,
      qualification,
    } = req.body;

    const newUser = new User({
      name,
      email,
      password,
      role,
      phone,
      address,
      language,
      qualification,
    });

    await newUser.save();

    console.log("✅ New user saved to MongoDB:", newUser);

    // res.send("<h2>Signup successful! Your data has been saved.</h2>");
    res.redirect("/html/login.html");
  } catch (err) {
    console.error("❌ Error saving user:", err);
    res.status(500).send("<h2>Something went wrong. Please try again.</h2>");
  }
});
