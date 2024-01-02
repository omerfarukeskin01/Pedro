const express = require("express");
const router = express.Router();
const { validateToken } = require("../middlewares/AuthMiddleware");
const { Lists, Medias, listmedia } = require("../models");
const { where } = require("sequelize");

router.post("/", validateToken, async (req, res) => {
  //listname almak yeterli
  const list = req.body;
  list.UserId = req.user.id; //geçici olarak body
  await Lists.create(list);
  res.json(list);
});
router.get("/getlistbylistid/:id", async (req, res) => {
  // doğrudan medya listini ver
  const listid = req.params.id;
  console.log(listid, "getlistbyuseridlistid");

  try {
    const response = await Lists.findOne({
      where: { id: listid },
      include: [{ model: Medias }],
    });

    if (response) {
      res.json(response.Medias);
    } else {
      res.json([]); // or handle the case when the list is not found
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post("/addmediatolist", async (req, res) => {
  //{MediaId:x,listid:y}
  await Lists.findByPk(req.body.listid)
    .then((list) => {
      if (!list) {
        console.log("list not found!+" + req.body.listid); //oturum açmış kullanıcının idsi
        req.json("ERROR");
      }
      Medias.findByPk(req.body.MediaId).then((media) => {
        //user id tokenden alınabilir
        if (!media) {
          console.log("media not found!+" + req.body.MediaId);
          req.json("ERROR");
        }
        console.log(`>> media ID=${media.id} listID=${list.id}`);
        list.addMedias(media);

        res.json("SUCCESS");
      });
    })
    .catch((err) => {
      console.log(
        ">> Error while following: ",
        err,
        "liste : ",
        req.body.listid,
        "eklenecek medya: ",
        req.body.MediaId
      );
      res.json("ERROR");
    });
});

router.delete("/removemediafromlist", async (req, res) => {
  await Lists.findByPk(req.body.listid)
    .then((list) => {
      if (!list) {
        console.log("list not found!+" + req.body.listid); //oturum açmış kullanıcının idsi
        req.json("ERROR");
      }
      Medias.findByPk(req.body.MediaId).then((media) => {
        //user id tokenden alınabilir
        if (!media) {
          console.log("media not found!+" + req.body.MediaId);
          req.json("ERROR");
        }
        console.log(`>> media ID=${media.id} list ID=${list.id}`);
        list.removeMedias(media);

        res.json("SUCCESS");
      });
    })
    .catch((err) => {
      console.log(
        ">> Error while removeal: ",
        err,
        "mediaid: ",
        req.body.MediaId,
        "listid: ",
        req.body.listid
      );
      res.json("ERROR");
    });
});
router.get("/:id", async (req, res) => {
  //kullanıcının idsine göre sadece listelerini alma
  const userid = req.params.id;
  console.log("PARARRMMAMMMMAAAMMMMMMİD", userid);
  const userslists = await Lists.findAll({
    where: { userid: userid },
  });
  res.json(userslists);
});
module.exports = router;
