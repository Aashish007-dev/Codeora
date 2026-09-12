import {Router} from 'express';
import passport from 'passport';
import userModel from '../models/user.model.js';
import jwt from 'jsonwebtoken';

const authRouter = Router();


authRouter.get(
    "/google",
    passport.authenticate("google", {
        session: false,
        scope: ["profile", "email"]
    })
);

authRouter.get(
    "/google/callback",
    passport.authenticate("google", {
        failureRedirect: "/",
        session: false
    }),
    async (req, res) => {
        try {
            const { id, displayName, emails, photos } = req.user;

            let user = await userModel.findOne({
                googleId: id
            });

            if (!user) {
                user = new userModel({
                    googleId: id,
                    email: emails?.[0]?.value,
                    name: displayName,
                    avatar: photos?.[0]?.value
                });

                await user.save();
            }

            const token = jwt.sign(
                { id: user._id },
                process.env.JWT_SECRET,
                { expiresIn: "1h" }
            );

            res.cookie("token", token, {
                httpOnly: true
            });

            res.redirect("/");
        } catch (error) {
            console.log(
                "Error during google authentication:",
                error
            );

            res.redirect("/");
        }
    }
);

export default authRouter;