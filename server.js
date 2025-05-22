const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const session = require("express-session");
const multer = require('multer');
const fs = require('fs');

// Import models
const User = require("./models/user");
const Session = require("./models/session");
const Rating = require("./models/rating");
const Activity = require("./models/activity");
const Notification = require("./models/notification");

// Connect to MongoDB
mongoose
  .connect(
    "mongodb+srv://fathersadvice3:QfKrVFPDDpArwvSq@fathersadvicecluster.rpgjh9d.mongodb.net/?retryWrites=true&w=majority&appName=fathersAdviceCluster"
  )
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB Atlas connection error:", err));

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "public")));

// Serve HTML files from public/html
app.use('/html', express.static(path.join(__dirname, "public/html")));

// Session configuration
app.use(session({
  secret: "your-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true
  }
}));

// Authentication middleware
const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/login");
  }
};

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/html", "index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public/html", "login.html"));
});

app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "public/html/signup.html"));
});

// List of random profile images (from randomuser.me)
const randomProfileImages = [
  'https://randomuser.me/api/portraits/men/32.jpg',
  'https://randomuser.me/api/portraits/women/44.jpg',
  'https://randomuser.me/api/portraits/men/65.jpg',
  'https://randomuser.me/api/portraits/women/68.jpg',
  'https://randomuser.me/api/portraits/men/12.jpg',
  'https://randomuser.me/api/portraits/women/25.jpg',
  'https://randomuser.me/api/portraits/men/77.jpg',
  'https://randomuser.me/api/portraits/women/81.jpg',
  'https://randomuser.me/api/portraits/men/41.jpg',
  'https://randomuser.me/api/portraits/women/50.jpg'
];

// Handle signup
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
      profilePhoto // allow for explicit profilePhoto in the future
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Assign a random profile image if not provided
    let assignedProfilePhoto = profilePhoto;
    if (!assignedProfilePhoto) {
      assignedProfilePhoto = randomProfileImages[Math.floor(Math.random() * randomProfileImages.length)];
    }
    console.log(`Assigned profile photo for ${email}: ${assignedProfilePhoto}`);

    // Create new user
    const newUser = new User({
      name,
      email,
      password,
      role,
      phone,
      address,
      language,
      qualification,
      profilePhoto: assignedProfilePhoto
    });

    // Save user to database
    await newUser.save();

    // Log success
    console.log("✅ New user registered:", {
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
      profilePhoto: newUser.profilePhoto
    });

    // Respond with JSON for AJAX
    res.status(200).json({ success: true, redirect: "/login" });
  } catch (error) {
    console.error("❌ Signup error:", error);
    res.status(500).json({ error: error.message || "Registration failed. Please try again." });
  }
});

// Login route handler
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', { email }); // Debug log
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email); // Debug log
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Compare passwords
    if (user.password !== password) {
      console.log('Invalid password for user:', email); // Debug log
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Set session data
    req.session.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      profilePhoto: user.profilePhoto,
      bio: user.bio,
      phone: user.phone,
      address: user.address,
      language: user.language,
      qualification: user.qualification
    };

    console.log('Login successful for user:', email); // Debug log
    
    // Return success response with redirect to the new dashboard
    res.json({ 
      success: true, 
      redirect: '/dashboard',
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        profilePhoto: user.profilePhoto
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'An error occurred during login. Please try again.' });
  }
});

// New unified dashboard route
app.get('/dashboard', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public/html/dashboard.html'));
});

app.get('/mentor-profile', isAuthenticated, (req, res) => {
    if (req.session.user.role !== 'mentor') {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, 'public/html/mentor-profile.html'));
});

app.get('/mentor-mentees', isAuthenticated, (req, res) => {
    if (req.session.user.role !== 'mentor') {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, 'public/html/mentor-mentees.html'));
});

app.get('/mentor-sessions', isAuthenticated, (req, res) => {
    if (req.session.user.role !== 'mentor') {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, 'public/html/mentor-sessions.html'));
});

app.get('/mentor-sessions/new', isAuthenticated, (req, res) => {
    if (req.session.user.role !== 'mentor') {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, 'public/html/new-session.html'));
});

app.get('/mentor-messages', isAuthenticated, (req, res) => {
    if (req.session.user.role !== 'mentor') {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, 'public/html/mentor-messages.html'));
});

app.get('/mentor-resources', isAuthenticated, (req, res) => {
    if (req.session.user.role !== 'mentor') {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, 'public/html/mentor-resources.html'));
});

app.get('/mentor-resources/new', isAuthenticated, (req, res) => {
    if (req.session.user.role !== 'mentor') {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, 'public/html/new-resource.html'));
});

app.get('/mentor-settings', isAuthenticated, (req, res) => {
    if (req.session.user.role !== 'mentor') {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, 'public/html/mentor-settings.html'));
});

app.get('/mentor-analytics', isAuthenticated, (req, res) => {
    if (req.session.user.role !== 'mentor') {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, 'public/html/mentor-analytics.html'));
});

// API Routes for Dashboard
app.get('/api/dashboard/stats', isAuthenticated, async (req, res) => {
    try {
        const stats = await User.aggregate([
            { $match: { role: 'mentee' } },
            { $count: 'activeMentees' }
        ]);

        const sessions = await Session.countDocuments({
            mentorId: req.session.user._id,
            date: { $gte: new Date() }
        });

        const ratings = await Rating.aggregate([
            { $match: { mentorId: req.session.user._id } },
            { $group: { _id: null, average: { $avg: '$rating' } } }
        ]);

        res.json({
            activeMentees: stats[0]?.activeMentees || 0,
            upcomingSessions: sessions,
            averageRating: ratings[0]?.average || 0
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
});

app.get('/api/dashboard/activities', isAuthenticated, async (req, res) => {
    try {
        const activities = await Activity.find({
            userId: req.session.user._id
        }).sort({ timestamp: -1 }).limit(10);

        res.json(activities);
    } catch (error) {
        console.error('Error fetching activities:', error);
        res.status(500).json({ error: 'Failed to fetch activities' });
    }
});

app.get('/api/dashboard/sessions', isAuthenticated, async (req, res) => {
    try {
        const sessions = await Session.find({
            mentorId: req.session.user._id,
            date: { $gte: new Date() }
        }).sort({ date: 1 }).limit(5)
        .populate('menteeId', 'name');

        res.json(sessions.map(session => ({
            id: session._id,
            title: session.title,
            date: session.date,
            duration: session.duration,
            menteeName: session.menteeId.name
        })));
    } catch (error) {
        console.error('Error fetching sessions:', error);
        res.status(500).json({ error: 'Failed to fetch sessions' });
    }
});

app.get('/api/notifications', isAuthenticated, async (req, res) => {
    try {
        const notifications = await Notification.find({
            userId: req.session.user._id
        }).sort({ timestamp: -1 }).limit(10);

        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// Profile Photo Upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/profile-photos/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, req.session.user._id + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

app.post('/api/user/photo', isAuthenticated, upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const photoPath = '/uploads/profile-photos/' + req.file.filename;
        
        await User.findByIdAndUpdate(req.session.user._id, {
            profilePhoto: photoPath
        });

        // Update session data
        req.session.user.profilePhoto = photoPath;

        res.json({ profilePhoto: photoPath });
    } catch (error) {
        console.error('Error uploading photo:', error);
        res.status(500).json({ error: 'Failed to upload photo' });
    }
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("❌ Logout error:", err);
    }
    res.redirect("/login");
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// Find Mentor page
app.get("/find_mentor", (req, res) => {
  res.sendFile(path.join(__dirname, "public/html", "find_mentor.html"));
});

// Handle form submission from "Find Mentor"
app.post("/find-mentor", (req, res) => {
  const { field, location, details } = req.body;

  console.log("Received form data:", { field, location, details });

  res.send("<h2>Thank you! Your request has been received.</h2>");
});

// Debug route to check user data
app.get("/debug/user/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({
      user: {
        email: user.email,
        role: user.role,
        rawRole: user.role,
        processedRole: user.role?.toString()?.toLowerCase()?.trim()
      }
    });
  } catch (error) {
    console.error("Debug error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Create uploads directory if it doesn't exist
const uploadsDir = 'public/uploads/profile-photos';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// API Endpoints
app.get('/api/user/current', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({ user: req.session.user });
});

// API Routes
app.get('/api/mentors/featured', async (req, res) => {
  try {
    const mentors = await User.find({ 
      role: 'mentor',
      isActive: true 
    }).limit(6);
    
    res.json(mentors.map(mentor => ({
      _id: mentor._id,
      name: mentor.name,
      expertise: mentor.qualification,
      bio: mentor.bio || 'No bio available',
      profilePhoto: mentor.profilePhoto,
      rating: 4.5, // Default rating
      reviews: 10 // Default number of reviews
    })));
  } catch (error) {
    console.error('Error fetching featured mentors:', error);
    res.status(500).json({ error: 'Failed to fetch mentors' });
  }
});

app.get('/api/mentors/filter', async (req, res) => {
  try {
    const { expertise, language } = req.query;
    const query = { role: 'mentor', isActive: true };
    
    if (expertise) query.qualification = expertise;
    if (language) query.language = language;
    
    const mentors = await User.find(query);
    
    res.json(mentors.map(mentor => ({
      _id: mentor._id,
      name: mentor.name,
      expertise: mentor.qualification,
      bio: mentor.bio || 'No bio available',
      profilePhoto: mentor.profilePhoto,
      rating: 4.5, // Default rating
      reviews: 10 // Default number of reviews
    })));
  } catch (error) {
    console.error('Error filtering mentors:', error);
    res.status(500).json({ error: 'Failed to filter mentors' });
  }
});

app.get('/api/testimonials', async (req, res) => {
  try {
    // Sample testimonials data
    const testimonials = [
      {
        content: "This platform has been a game-changer for my career. My mentor provided invaluable guidance and support.",
        authorName: "John Doe",
        authorRole: "Software Engineer",
        authorPhoto: "/images/default-avatar.png"
      },
      {
        content: "I found the perfect mentor who helped me navigate through my career challenges. Highly recommended!",
        authorName: "Jane Smith",
        authorRole: "Product Manager",
        authorPhoto: "/images/default-avatar.png"
      },
      {
        content: "The mentorship program exceeded my expectations. The platform is user-friendly and the mentors are exceptional.",
        authorName: "Mike Johnson",
        authorRole: "Business Analyst",
        authorPhoto: "/images/default-avatar.png"
      }
    ];
    
    res.json(testimonials);
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
});

// API endpoint for searching mentors
app.get('/api/mentors/search', async (req, res) => {
    try {
        const { 
            page = 1, 
            search, 
            expertise, 
            language, 
            rating, 
            availability, 
            sortBy = 'rating' 
        } = req.query;
        
        console.log('Search request received:', { page, search, expertise, language, rating, availability, sortBy });
        
        // Build the query
        const query = { role: 'mentor' };
        
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { bio: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (expertise) {
            query.qualification = { $regex: expertise, $options: 'i' };
        }
        
        if (language) {
            query.language = { $regex: language, $options: 'i' };
        }
        
        if (rating && rating !== '0') {
            query.rating = { $gte: parseFloat(rating) };
        }
        
        if (availability) {
            query.availability = availability;
        }
        
        // Build sort options
        let sortOptions = {};
        switch (sortBy) {
            case 'rating':
                sortOptions = { rating: -1 };
                break;
            case 'reviews':
                sortOptions = { reviews: -1 };
                break;
            case 'price':
                sortOptions = { price: 1 };
                break;
            case 'price-desc':
                sortOptions = { price: -1 };
                break;
            default:
                sortOptions = { rating: -1 };
        }
        
        // Pagination
        const pageSize = 12;
        const skip = (page - 1) * pageSize;
        
        console.log('Executing query:', { query, sortOptions, skip, pageSize });
        
        // Get total count for pagination
        const total = await User.countDocuments(query);
        const pages = Math.ceil(total / pageSize);
        
        // Find mentors matching the query
        const mentors = await User.find(query)
            .select('name profilePhoto bio language qualification rating reviews availability price')
            .sort(sortOptions)
            .skip(skip)
            .limit(pageSize);
        
        console.log(`Found ${mentors.length} mentors out of ${total} total`);
        
        res.json({
            mentors,
            total,
            pages
        });
    } catch (error) {
        console.error('Error searching mentors:', error);
        res.status(500).json({ error: 'Failed to search mentors' });
    }
});

// Handle mentor profile completion
app.post('/api/mentor/profile', upload.single('profilePhoto'), async (req, res) => {
    try {
        // Check if user is authenticated and is a mentor
        if (!req.session.user || req.session.user.role !== 'mentor') {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const mentorId = req.session.user._id;
        
        // Prepare profile data
        const profileData = {
            name: req.body.fullName,
            professionalTitle: req.body.professionalTitle,
            bio: req.body.bio,
            primaryExpertise: req.body.primaryExpertise,
            additionalExpertise: JSON.parse(req.body.additionalExpertise),
            yearsExperience: parseInt(req.body.yearsExperience),
            currentPosition: req.body.currentPosition,
            previousPositions: req.body.previousPositions.split('\n').filter(pos => pos.trim()),
            highestEducation: req.body.highestEducation,
            fieldOfStudy: req.body.fieldOfStudy,
            certifications: req.body.certifications.split('\n').filter(cert => cert.trim()),
            mentoringStyle: req.body.mentoringStyle,
            sessionDuration: parseInt(req.body.sessionDuration),
            price: parseFloat(req.body.sessionPrice),
            availability: JSON.parse(req.body.availability),
            communication: JSON.parse(req.body.communication),
            language: req.body.primaryLanguage,
            additionalLanguages: JSON.parse(req.body.additionalLanguages),
            isProfileComplete: true
        };

        // Handle profile photo upload
        if (req.file) {
            const photoPath = `/uploads/profile-photos/${req.file.filename}`;
            profileData.profilePhoto = photoPath;
        }

        // Update mentor profile in User collection
        const mentor = await User.findByIdAndUpdate(
            mentorId,
            { $set: profileData },
            { new: true }
        );

        if (!mentor) {
            return res.status(404).json({ error: 'Mentor not found' });
        }

        res.json({ message: 'Profile updated successfully', mentor });
    } catch (error) {
        console.error('Error updating mentor profile:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Get mentor profile data
app.get('/api/mentor/profile', async (req, res) => {
    try {
        // Check if user is authenticated
        if (!req.session.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const userId = req.session.user._id;
        
        // Find mentor profile in User collection
        const mentor = await User.findById(userId);
        
        if (!mentor) {
            return res.status(404).json({ error: 'Mentor not found' });
        }

        res.json({
            role: mentor.role,
            isProfileComplete: mentor.isProfileComplete,
            profile: mentor
        });
    } catch (error) {
        console.error('Error fetching mentor profile:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});


