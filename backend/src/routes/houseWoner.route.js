import { Router } from "express";
import { upload } from "../middlewere/multer.middlewire.js";
import { verifyJWTForHouseWoner } from "../middlewere/authHouseOwner.middlewire.js";
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
router.route("/HouseWonerLogout").post(verifyJWTForHouseWoner,logoutWoner);
router.route("/Profile").post(verifyJWTForHouseWoner,getProfile);
router.route("/regenerateWonerTokens").post(WonerRefreshAccessToken);
router.route("/updateWonerAvatar").patch(
    upload.fields([
        {
            name : "avatar",
            maxCount : 1
        }
    ]),
    verifyJWTForHouseWoner,
    updateWonerAvatar
)
router.route("/changeWonerPassword").patch(verifyJWTForHouseWoner,changeWonerPassword);
router.route("/changeScanner").patch(
    upload.fields([
        {
            name : "scanner",
            maxCount : 1
        }
    ]),
    verifyJWTForHouseWoner,changeScanner);
router.route("/changeUpiId").patch(verifyJWTForHouseWoner,changeUpiId);
router.route("/changeEmail").patch(verifyJWTForHouseWoner,changeEmail);


export default router