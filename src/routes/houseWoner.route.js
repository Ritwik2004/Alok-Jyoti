import { Router } from "express";
import { upload } from "../middlewere/multer.middlewire.js";
import { verifyJWT } from "../middlewere/auth.middlewire.js";
import { registerHouseWoner, HouseWonerLogin, logoutWoner, getProfile, WonerRefreshAccessToken, updateWonerAvatar, changeWonerPassword, changeScanner, changeUpiId, changeEmail } from "../controllers/houseWoner.controller.js";


const router = Router()

router.route("/registerHouseWoner").post(
    upload.fields([
        {
            name : "avatar",
            maxCount : 1
        },
        {
            name : "scanner",
            maxCount : 1
        }
    ]),
    registerHouseWoner);
router.route("/HouseWonerLogin").post(HouseWonerLogin);
router.route("HouseWonerLogout").post(verifyJWT,logoutWoner);
router.route("/Profile").post(verifyJWT,getProfile);
router.route("/regenerateWonerTokens").post(WonerRefreshAccessToken);
router.route("/updateWonerAvatar").patch(
    upload.fields([
        {
            name : "avatar",
            maxCount : 1
        }
    ]),
    verifyJWT,
    updateWonerAvatar
)
router.route("/changeWonerPassword").patch(verifyJWT,changeWonerPassword);
router.route("/changeScanner").patch(
    upload.fields([
        {
            name : "scanner",
            maxCount : 1
        }
    ]),
    verifyJWT,changeScanner);
router.route("/changeUpiId").patch(verifyJWT,changeUpiId);
router.route("/changeEmail").patch(verifyJWT,changeEmail);


export default router