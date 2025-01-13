import { Router } from "express";
import { verifyJWT } from "../middlewere/auth.middlewire.js";
import { upload } from "../middlewere/multer.middlewire";
import { uploadProduct, viewProduct, ChangeDeleveryDate, changePrice, changeAvaliability, starAndReview } from "../controllers/product.controler";

const router = Router()

router.route("/productUploadition").post(
    upload.fields([
        {
            name : "image1",
            maxCount : 1
        },
        {
            name : "image2",
            maxCount : 1
        }
    ]),
    verifyJWT,
    uploadProduct
)
router.route("/:productId").get(verifyJWT,viewProduct)
router.route("/:productId/changeDeliveryDate").get(verifyJWT,ChangeDeleveryDate)
router.route("/:productId/changePrice").get(verifyJWT,changePrice)
router.route("/:productId/changeAvaliability").get(verifyJWT,changeAvaliability)
router.route("/:productId/Review").get(verifyJWT,starAndReview)

export default router;
