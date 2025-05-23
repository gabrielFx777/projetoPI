const express = require("express");
const router = express.Router();
const {
  obterClimaPorIntervalo,
  listarClimaPorRoteiro,
} = require("../controllers/climaController");

router.post("/clima", obterClimaPorIntervalo);
router.get("/clima/:roteiro_id", listarClimaPorRoteiro);

module.exports = router;
