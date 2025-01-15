import { Router } from "express";
import { verifyJWT } from "../middlewere/auth.middlewire.js";
import { productOrder } from "../controllers/order.controler.js";

const router = Router()

router.route("/:productId/Order").get(verifyJWT,productOrder)



export default router