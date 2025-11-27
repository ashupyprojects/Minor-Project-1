// server.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = 3000;

// Path for storing user data
const USERS_FILE = path.join(__dirname, "users.json");

// Middleware to parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (HTML, CSS, images)
app.use(express.static(__dirname));

// Helper: Load users from JSON file
function loadUsers() {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(USERS_FILE, "utf8");
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error("Error reading users file:", err);
    return [];
  }
}

// Helper: Save users to JSON file
function saveUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (err) {
    console.error("Error writing users file:", err);
  }
}

/* =============== SIGNUP API =============== */
app.post("/api/signup", async (req, res) => {
  try {
    const {
      name,
      dob,
      state,
      category,
      employmentStatus,
      casteCategory,
      email,
      password,
    } = req.body;

    // Optional safe log (no password)
    console.log("Signup attempt for:", email);

    // Validate fields from form (must match names)
    if (
      !name ||
      !dob ||
      !state ||
      !category ||
      !employmentStatus ||
      !casteCategory ||
      !email ||
      !password
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    const users = loadUsers();

    // Check if email already exists
    const existingUser = users.find((u) => u.email === email);
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: Date.now(),
      name,
      dob,
      state,
      category,
      employmentStatus,
      casteCategory,
      email,
      password: hashedPassword,
    };

    users.push(newUser);
    saveUsers(users);

    return res.json({
      success: true,
      message: "Signup successful. You can now sign in.",
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

/* =============== SIGNIN API =============== */
app.post("/api/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Safe log: email only, no password
    console.log("Login attempt for:", email);

    // Basic validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required." });
    }

    const users = loadUsers();

    // Find user by email
    const user = users.find((u) => u.email === email);
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password." });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password." });
    }

    // Success – send user data (without password)
    return res.json({
      success: true,
      message: "Sign in successful.",
      user: {
        id: user.id,
        name: user.name,
        dob: user.dob,
        state: user.state,
        category: user.category,
        employmentStatus: user.employmentStatus,
        casteCategory: user.casteCategory,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Signin error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

/* =============== TEST ROUTE (OPTIONAL) =============== */
app.get("/api/ping", (req, res) => {
  res.json({ ok: true, message: "Server is alive" });
});

/* =============== START SERVER =============== */
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
