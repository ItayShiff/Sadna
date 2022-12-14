const router = require("express").Router();
// const axios = require("axios")
// const { join } = require("path")
// const relativePathToEnv = join(__dirname, "../../.env")
// require("dotenv").config({ path: relativePathToEnv })
const axios = require("axios");

//  /api/images/generate
router.post("/generate", async (req, res) => {
  const config = {
    method: "post",
    url: "http://bf.dallemini.ai/generate",
    headers: {
      "Content-Type": "application/json",
    },
    data: req.body,
  };

  axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
      res.send(response.data);
    })
    .catch(function (error) {
      res.status(500).send();
    });
});

module.exports = router;
