const router = require("express").Router()
// const axios = require("axios")
// const { join } = require("path")
// const relativePathToEnv = join(__dirname, "../../.env")
// require("dotenv").config({ path: relativePathToEnv })

const { SingletonRoomsList } = require("../SingletonRoomsList.js")


//  /api/room/XXX
router.get("/:roomID", async (req, res) => {
    const roomID = req.params.roomID;

    const roomsList = SingletonRoomsList.getInstance();
    const currentRoom = roomsList[roomID];

    if (currentRoom === undefined) {
        res.status(404).send(false)
    }

    res.send(currentRoom);
})


module.exports = router
