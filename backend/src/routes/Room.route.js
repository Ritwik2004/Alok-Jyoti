import { Router } from "express";
import { upload } from "../middlewere/multer.middlewire.js";
import { verifyJWTForHouseWoner } from "../middlewere/authHouseOwner.middlewire.js";
import { uploadRooms, updateAvaliable, deletRoom } from "../controllers/room.controler.js";

const router = Router();

router.route("/UploadRooms").post(
    upload.fields([
        {
            name : 'image1',
            maxCount : 1
        },
        {
            name : 'image2',
            maxCount : 1
        },
        {
            name : 'image3',
            maxCount : 1
        }
    ]),
    verifyJWTForHouseWoner,uploadRooms)
router.route("/updateAvaliavlity/:roomId").get(verifyJWTForHouseWoner,updateAvaliable)
router.route("/deleteRoomDetails").post(verifyJWTForHouseWoner,deletRoom)

export default router;