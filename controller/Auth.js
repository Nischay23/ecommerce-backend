const { User } = require("../model/User");
const crypto = require("crypto");
const { sanitizeUser } = require("../services/common");
const jwt = require("jsonwebtoken");

// Hardcoded secret key (temporary)
const SECRET_KEY = "SECRET_KEY";

// Helper function to hash passwords
const hashPassword = async (password, salt) =>
  new Promise((resolve, reject) => {
    crypto.pbkdf2(
      password,
      salt,
      310000,
      32,
      "sha256",
      (err, hashedPassword) => {
        if (err) reject(err);
        resolve(hashedPassword);
      }
    );
  });

// Create a new user
exports.createUser = async (req, res) => {
  try {
    const salt = crypto.randomBytes(16);
    const hashedPassword = await hashPassword(req.body.password, salt);

    const user = new User({
      ...req.body,
      password: hashedPassword,
      salt,
    });

    const doc = await user.save();

    req.login(sanitizeUser(doc), (err) => {
      if (err) {
        res.status(400).json({ message: "Error during login", error: err });
      } else {
        const token = jwt.sign(sanitizeUser(doc), SECRET_KEY, {
          expiresIn: "1h",
        });

        res
          .cookie("jwt", token, {
            expires: new Date(Date.now() + 3600000), // 1 hour
            httpOnly: true,
          })
          .status(201)
          .json({
            message: "User created successfully",
            id: doc.id,
            role: doc.role,
            token, // Optional: return the token in the response
          });
      }
    });
  } catch (err) {
    res.status(400).json({ message: "User creation failed", error: err });
  }
};

// Log in an existing user
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Hash the provided password with the stored salt
    const hashedPassword = await hashPassword(password, user.salt);

    // Verify the hashed password matches the stored password
    if (!hashedPassword.equals(user.password)) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate the token
    const token = jwt.sign(sanitizeUser(user), SECRET_KEY, { expiresIn: "1h" });

    // Send the token as a cookie and in the response
    res
      .cookie("jwt", token, {
        expires: new Date(Date.now() + 3600000), // 1 hour
        httpOnly: true,
      })
      .status(200)
      .json({
        message: "Login successful",
        token,
      });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err });
  }
};

// Check if the user is authenticated
exports.checkAuth = async (req, res) => {
  try {
    if (req.user) {
      res.status(200).json(req.user);
    } else {
      res.sendStatus(401);
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: "Authentication check failed", error: err });
  }
};
