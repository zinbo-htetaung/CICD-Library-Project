const model = require("../models/userModel.js");

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

module.exports.register = (req, res) => {
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

        console.log("Registration successful");
        res.status(201).json({ message: "Account created successfully" });
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
