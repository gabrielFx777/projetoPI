const express = require("express");
const router = express.Router();
const { buscarImagemCidade } = require("../controllers/imagemController");

router.get("/cidade-imagem", buscarImagemCidade);

module.exports = router;
