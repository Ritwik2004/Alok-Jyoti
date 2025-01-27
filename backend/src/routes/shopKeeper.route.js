import { Router } from "express";
import { verifyJWTForShopKeeper } from "../middlewere/authShopKeeper.middlewire.js";
import { registerShopkeeper,shopkeeperLogin,logoutShopKeeper,changeLocation,regenerateShopKeeperAccessAndRefreshToken, changePhNo } from "../controllers/shopKeeper.controler.js";


const router = Router()

router.route("/shopkeeperRegister").post(registerShopkeeper)
router.route("/shopkeeperLogin").post(shopkeeperLogin)
router.route("/shopkeeperLogout").post(verifyJWTForShopKeeper,logoutShopKeeper)
router.route("/LocationUpdate").patch(verifyJWTForShopKeeper,changeLocation)
router.route("/regenerateShopKeeperAccessAndRefreshToken").post(regenerateShopKeeperAccessAndRefreshToken)
router.route("/changePhoneNumber").patch(verifyJWTForShopKeeper,changePhNo)

export default router;
