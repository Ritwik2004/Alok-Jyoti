import { Router } from "express";
import { verifyJWTForShopKeeper } from "../middlewere/authShopKeeper.middlewire.js";
import { upload } from "../middlewere/multer.middlewire.js";
import { uploadProduct, viewProduct, ChangeDeleveryDate, changePrice, changeAvaliability, starAndReview, getAllProduct, getSearchedProducts } from "../controllers/product.controler.js";

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
    verifyJWTForShopKeeper,
    uploadProduct
)
router.route("/:productId").get(verifyJWTForShopKeeper,viewProduct)
router.route("/:productId/changeDeliveryDate").get(verifyJWTForShopKeeper,ChangeDeleveryDate)
router.route("/:productId/changePrice").get(verifyJWTForShopKeeper,changePrice)
router.route("/:productId/changeAvaliability").get(verifyJWTForShopKeeper,changeAvaliability)
router.route("/:productId/Review").get(verifyJWTForShopKeeper,starAndReview)
router.route("/products").post(getAllProduct)
router.route("/getSearchedProducts").post(getSearchedProducts)

export default router;
