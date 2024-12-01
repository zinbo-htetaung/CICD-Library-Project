const model = require("../models/userModel.js");

module.exports.checkUsernameOrEmailExist = (req, res, next) => {
    if (req.body.name == undefined || req.body.email== undefined || req.body.password== undefined || req.body.address== undefined || req.body.dob== undefined) {
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
    };

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

            res.locals.user_id = resId.rows[0].id;
            next();
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

module.exports.addUserStatus = (req, res) => {
    const userId = res.locals.user_id;

    if (!userId) {
        return res.status(400).json({ message: "User ID is missing" });
    }

    model.insertUserStatus(userId, (error) => {
        if (error) {
            console.error("Error inserting user status:", error);
            return res.status(500).json({ message: "Internal server error" });
        }

        console.log("Registration successful");
        res.status(201).json({ message: "Account created successfully" });
    });
};

module.exports.verifyCaptcha = async (req, res, next) => {
    const captchaToken = req.body['g-recaptcha-response']; // Token sent from the frontend
    const secretKey = "6LfclI4qAAAAANZJNamoflbSsdPpwZzOrjAKmGt7"; 

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

        res.status(200).json(results.rows);
    });
};

