import { Router } from "express";
import { loginUser, logoutUser, registerUser, getProfile, setProfile, getNewRefreshToken } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router
    .route("/register")
    .post(upload.fields([
        {
            name:"profile_picture",
            maxCount : 1

        }
    ]), registerUser)

router
    .route("/login")
    .post(loginUser)

// secured route

router
    .route("/logout")
    .post(verifyJWT, logoutUser)


router
    .route("/refreshToken")
    .post(getNewRefreshToken);

router
    .route("/profile/:userId")
    .get(getProfile)

router
    .route("/profile/:userId")
    .post(setProfile)

export default router;