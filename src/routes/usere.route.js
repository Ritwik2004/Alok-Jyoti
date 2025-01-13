import { Router } from "express";
import { upload } from "../middlewere/multer.middlewire.js";
import { verifyJWT } from "../middlewere/auth.middlewire.js";
import { registerUser, loginUser, logoutUser, refreshAccessToken, changePassword, updateAvatar, updateAccountDetails, getCurrentUser, getHouseWoner } from "../controllers/user.controller.js";

const router = Router();

//user(student)
router.route("/register").post(
    upload.fields([
        {
            name : "avatar",
            maxCount : 1
        }
    ]),
    registerUser
);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT,logoutUser);
router.route("/regenerateRefreshToken").post(refreshAccessToken);
router.route("/changePassword").patch(changePassword);
router.route("/updateAvatar").patch(
    upload.fields([
        {
            name : "avatar",
            maxCount : 1
        }
    ]),
    verifyJWT,updateAvatar);
router.route("/updateAccountDetails").patch(verifyJWT,updateAccountDetails);
router.route("/getCurrentUser").post(verifyJWT,getCurrentUser);
router.route("/Woner/:getWonerProfile").get(getHouseWoner)


export default router;