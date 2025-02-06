const { user } = require("pg/lib/defaults.js");
const model = require("../models/userModel.js");
const bcrypt = require("bcrypt");
const saltRounds = 10;


module.exports.checkUsernameOrEmailExist = (req, res, next) => {
    if (req.body.name == undefined || req.body.email == undefined || req.body.password == undefined || req.body.address == undefined || req.body.dob == undefined) {
        return res.status(400).json({ message: "Input fields missing" });
    }

    const data = {
        name: req.body.name,
        email: req.body.email,
    };

    model.checkExistence(data, (error, results) => {
        if (error) {
            console.error("Error checking user and email:", error);
            return res.status(500).json({ message: "Server error" });
        }

        if (results[0].length > 0) {
            return res.status(409).json({ message: "Username already exists. Please use another username" });
        } else if (results[1].length > 0) {
            return res.status(409).json({ message: "Email already in use. Please use another email account" });
        } else {
            next();
        }
    });
};

module.exports.register = (req, res, next) => {
    const data = {
        name: req.body.name,
        email: req.body.email,
        password: res.locals.hash,
        address: req.body.address,
        dob: req.body.dob,
        avatar: "https://api.dicebear.com/9.x/initials/svg?seed="+(req.body.name.replace(/\s+/g, '')).toString().toUpperCase()+"&scale=50&radius=50"
    };

    console.log(data)


    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;        // validate email regex

    const isValidDate = !isNaN(Date.parse(data.dob));

    if (!emailRegex.test(data.email) || !isValidDate) {
        return res.status(400).json({ message: "Please input correct type of data" });
    }


    model.insertSingle(data, (error, result) => {
        if (error) {
            console.error("Error during registration:", error);
            return res.status(500).json({ message: "Internal server error" });
        }

        model.getUserIdByEmail(data.email, (err, resId) => {
            if (err) {
                console.error("Error fetching user ID:", err);
                return res.status(500).json({ message: "Internal server error" });
            }

            if (resId.rows.length === 0) {
                return res.status(404).json({ message: "User not found after insertion" });
            }

            console.log("Registration successful");
            return res.status(201).json({ message: "Account created successfully" });
        });
    });
};

module.exports.login = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password' });
    }

    model.checkEmail(email)
        .then(function (user) {
            if (!user) {
                console.log("Invalid account/password");
                return res.status(401).json({ message: 'Invalid account or password' });
            }
            res.locals.hash = user.password;
            res.locals.name = user.name;
            res.locals.user_id = user.id;
            res.locals.role = user.role;
            next();
        })
        .catch(function (error) {
            return res.status(500).json({ message: error.message });
        });
}
module.exports.getProfileInfo = (req, res) => {
    const userId = res.locals.user_id;

    if (!userId) {
        return res.status(400).json({ message: "User ID not found in token" });
    }

    model.getProfileInfo(userId)
        .then(profile => {
            res.status(200).json({ profile });
        })
        .catch(error => {
            if (error.message === 'User not found') {
                return res.status(404).json({ message: "User not found" });
            }
            console.error("Error fetching profile info:", error);
            return res.status(500).json({ error: "An unexpected error occurred" });
        });
};

module.exports.verifyCaptcha = async (req, res, next) => {
    const captchaToken = req.body['g-recaptcha-response']; // Token sent from the frontend
    const secretKey = "6LfMGboqAAAAAPXLtwKP9GUaVE9Ly2eqJKsHQLYw";

    // Bypass CAPTCHA validation during tests
    if (captchaToken == 'test-captcha-token') {
        console.log("CAPTCHA bypassed for testing.");
        return next();
    }

    if (!captchaToken) {
        return res.status(400).json({ message: "Captcha verification failed. Please try again." });
    }

    try {
        // Use fetch to send a POST request to Google's reCAPTCHA API
        const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                secret: secretKey,       // Secret key from Google
                response: captchaToken,  // CAPTCHA token from frontend
            }),
        });

        const data = await response.json(); // Parse the JSON response

        // Check if the CAPTCHA verification succeeded
        if (!data.success) {
            return res.status(400).json({ message: "Captcha verification failed. Please try again." });
        }

        next();     // catpcha valid - proceed with registering
    } catch (error) {
        console.error("Error verifying CAPTCHA:", error);
        return res.status(500).json({ message: "Internal server error during CAPTCHA verification." });
    }
};

module.exports.getAllUsers = (req, res, next) => {
    model.getAllUsers((error, results) => {
        if (error) {
            console.error("Error fetching users:", error);
            return res.status(500).json({ message: "Internal server error" });
        }

        if (results.rows.length === 0) {
            return res.status(404).json({ message: "No users found." });
        }

        res.status(200).json({ users: results.rows });
    });
};


module.exports.checkDuplicateEmail = (req, res, next) => {
    const userId = res.locals.user_id;
    const email = req.body.email
    model.checkEmailToUpdate(email, userId)
        .then(function (user) {
            if (user) {
                console.log("User with this email already exist");
                return res.status(401).json({ message: 'User with this email already exist' });
            }

    console.log("User ID:", userId);
    console.log("Email to check:", email);

    try {
        const user = await model.checkEmailToUpdate(email, userId);

        if (user) {
            console.log("User with this email already exists");
            return res.status(401).json({ message: "User with this email already exists" });
        }

        console.log("No duplicate email found");
        next(); // Proceed to the next middleware
    } catch (error) {
        console.error("Error checking duplicate email:", error);
        return res.status(500).json({ message: error.message });
    }
};


module.exports.updateProfileInfo = async (req, res) => {
    const userId = res.locals.user_id;


    if (!userId) {
        return res.status(400).json({ message: "User ID not found in token" });
    }
    if (!req.body.name || !req.body.email || !req.body.address) {
        return res.status(400).json({ message: "Input(s) is/are required " })
    }
    const data = {
        user_id: userId,
        name: req.body.name,
        email: req.body.email,
        address: req.body.address
    }
    console.log(data)
    await model.updateProfileInfo(data)
        .then(() => {

            console.log("updated")
            return res.status(200).json({ message:"Profile updated successfully" });

        })
        .catch(error => {
            if (error.message === 'User not found') {
                console.log("User not found for ID:", data.user_id);
                return res.status(404).json({ message: "User not found" });
            }
            console.error("Error updating profile:", error);
            return res.status(500).json({ error: "An unexpected error occurred" });
        });
};

module.exports.getPassword = (req, res, next) => {
    const userId = res.locals.user_id;

    if (!userId) {
        return res.status(400).json({ message: "User ID not found in token" });
    }
    if (!req.body.oldPassword || !req.body.newPassword) {
        return res.status(400).json({ message: "Both oldPassword and newPassword are required" });
    }

    model.getPassword(userId)
        .then((password) => {
            if (!password) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.locals.hash = password; // Store the retrieved password in res.locals
            next(); // Pass control to the next middleware
        })
        .catch((error) => {
            console.error("Error retrieving password:", error);
            return res.status(500).json({ message: "An unexpected error occurred" });
        });
};

module.exports.compareOldPassword = (req, res, next) => {
    const callback = (err, isMatch) => {
        if (err) {
            console.error("Error bcrypt:", err);
            res.status(500).json(err);
        } else if (isMatch) {
            next();
        } else {
            res.status(401).json({
                message: "Old password is incorrect",
            });
        }
    };
    bcrypt.compare(req.body.oldPassword, res.locals.hash, callback);
}

module.exports.hashPassword = function (req, res, next) {
    const callback = (err, hash) => {
        if (err) {
            console.error("Error bcrypt:", err);
            res.status(500).json(err);
        } else {
            console.log("old pw" + req.body.oldPassword)
            console.log("new password:" + req.body.newPassword)
            console.log("new password:" + hash)
            res.locals.hash = hash;
            next();
        }
    };
    bcrypt.hash(req.body.newPassword, saltRounds, callback);
};



module.exports.updatePassword = (req, res) => {
    const data = {
        user_id: res.locals.user_id,
        newPassword: res.locals.hash
    }
    model.updatePassword(data)
        .then(() => {
            res.status(200).json({ message: "Profile updated successfully" });
        })
        .catch(error => {
            if (error.message === 'User not found') {
                console.log("User not found for ID:", data.user_id);
                return res.status(404).json({ message: "User not found" });
            }
            console.error("Error updating profile:", error);
            return res.status(500).json({ error: "An unexpected error occurred" });
        });
};


// controller.js or userController.js
module.exports.deleteAccount = async (req, res) => {
    const userId = res.locals.user_id; // assuming the userId is in the request (auth token or session)

    if (!userId) {
        return res.status(400).json({ message: "User ID not found in token" });
    }

    const data = { user_id: userId };

    try {
        const result = await model.deleteAccount(data);
        return res.status(200).json(result);
    } catch (error) {
        if (error.message === 'User not found') {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(500).json({ error: "An unexpected error occurred" });
    }
};

module.exports.banUser = (req, res) => {
    const userId = parseInt(req.params.userId, 10); // validate the user ID

    if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
    }

    model.banUser(userId)
        .then(() => {
            return res.status(200).json({ message: "User successfully deleted!" });
        })
        .catch((error) => {
            if (error.message === "UserNotFound") {
                return res.status(404).json({ message: "User not found" });
            }
            console.error("Error deleting user:", error);
            return res.status(500).json({ message: "Internal server error" });
        });
};


module.exports.updateProfilePicture = async (req, res) => {
    const userId = res.locals.user_id; // Assuming user ID is extracted from auth middleware or session

    if (!userId) {
        return res.status(400).json({ message: "User ID not found in token" });
    }

    const { avatar } = req.body;

    // Validate the avatar URL
    if (!avatar || typeof avatar !== 'string') {
        return res.status(400).json({ message: "Invalid avatar URL" });
    }

    try {
        // Data to pass to the model
        const data = { user_id: userId, avatar };

        // Call the model function to update the profile picture
        const result = await model.updateProfilePicture(data);
        console.log("updated pfp")
        // Respond with success
        return res.status(200).json({
            message: "Profile picture updated successfully",
            profile: result, // Assuming the model returns the updated user profile
        });
    } catch (error) {
        console.log("updated pfp---error")

        if (error.message === 'User not found') {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(500).json({ error: "An unexpected error occurred" });
    }
};

module.exports.getUserByID = async  (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
    }

    try {
        const result = await model.getUserByID(userId);
        return res.status(200).json(result[0]);
    } catch (error) {
        if (error.message === "UserNotFound") {
            return res.status(404).json({ message: "User not found" });
        }
        console.error("Error get user by ID:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
