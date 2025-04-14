import { Router } from "express";
import {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
} from "../controllers/playlist.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router()

router.use(verifyJWT)

router.route("/").post(createPlaylist) // tested

router
.route("/:playlistId")
.get(getPlaylistById) // tested
.patch(updatePlaylist) // tested
.delete(deletePlaylist) // tested

router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist) // tested
router.route("/remove/:videoId/:playlistId").patch(removeVideoFromPlaylist) // tested
router.route("/user/:userId").get(getUserPlaylists) // tested

export default router