import { Router } from "express";
import { verifyJWT } from "../middlewere/auth.middlewire.js";
import { registerShopkeeper,shopkeeperLogin,logoutShopKeeper,changeLocation,regenerateShopKeeperAccessAndRefreshToken, changePhNo } from "../controllers/shopKeeper.controler";


const router = Router()

router.route("/shopkeeperRegister").post(registerShopkeeper)
router.route("/shopkeeperLogin").post(shopkeeperLogin)
router.route("/shopkeeperLogout").post(verifyJWT,logoutShopKeeper)
router.route("/LocationUpdate").post(verifyJWT,changeLocation)
router.route("/regenerateShopKeeperAccessAndRefreshToken").post(regenerateShopKeeperAccessAndRefreshToken)
router.route("/changePhoneNumber").patch(verifyJWT,changePhNo)

export default router;
