const express = require("express");
const router = express.Router();
const passport = require("passport");

router.post("/", async (req, res, next) => {
    try {
        passport.authenticate("register", async (err, user, info) => {
            if (err) return next(err);
            if (!user) return res.status(400).send({ status: "error", message: "Credenciales invalidas" });

            req.session.user = {
                first_name: user.first_name,
                last_name: user.last_name,
                age: user.age,
                email: user.email,
                role: user.role,
            };

            req.session.login = true;

            res.redirect("/profile");
        })(req, res, next);
    } catch (error) {
        next(error);
    }
});

router.get("/failedregister", (req, res) => {
    res.send({ error: "Registro fallido" });
})

module.exports = router;