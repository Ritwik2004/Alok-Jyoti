import { Router } from "express";
import { verifyJWT } from "../middlewere/auth.middlewire.js";
import { upload } from "../middlewere/multer.middlewire.js";
import { uploadNotes, deletDocument, getAllNotes } from "../controllers/notes.controler.js";
import { addNotes, getFevNotes, removeNotes } from "../controllers/addFavourity.controler.js";


const router = Router()

router.route("/UploadNote").post(
    upload.fields([
        {
            name : "note",
            maxCount : 1
        }
    ]),verifyJWT,uploadNotes)
router.route("/deletDocument").post(deletDocument)

router.route("/addNotesPlaylist").post(verifyJWT,addNotes);
router.route("/getFevNotes").post(verifyJWT,getFevNotes);
router.route("/removeNotes/:deletableDocument").get(verifyJWT,removeNotes);
router.route("/notes").post(getAllNotes)

export default router