const express = require("express");
const router = express.Router();
const {
  criarRoteiro,
  listarRoteirosPorUsuario,
  listarTodosRoteiros,
  buscarRoteiroPorId,
  atualizarRoteiro,
  deletarRoteiro,
  adicionarPonto,
  listarPontosDoRoteiro,
  deletarPontoDoRoteiro,
  listarRestaurantesDoRoteiro,
  buscarRoteirosComExtras,
  substituirPonto,
  buscarRoteiroESeusPontos,
  buscarPontosExtras,
  buscarImagemCidade,
  buscarRoteiro,
} = require("../controllers/roteiroController");


router.post("/search", buscarRoteiro);
router.post("/roteiros2", criarRoteiro);
router.get("/roteiros2/usuario/:usuario_id", listarRoteirosPorUsuario);
router.get("/roteiros2", listarTodosRoteiros);
router.get("/roteiros2/:roteiro_id", buscarRoteiroPorId);
router.put("/roteiros2/:roteiro_id", atualizarRoteiro);
router.delete("/roteiros2/:roteiro_id", deletarRoteiro);
router.post("/roteiros2/:roteiro_id/pontos", adicionarPonto);
router.get("/roteiros2/:roteiro_id/pontos", listarPontosDoRoteiro);
router.delete("/pontos/:id", deletarPontoDoRoteiro);
router.get("/roteiros2/:roteiro_id/restaurantes", listarRestaurantesDoRoteiro);
router.get("/roteiros2-detalhados", buscarRoteirosComExtras);
router.post("/roteiros2/:roteiroId/substituir-ponto", substituirPonto);
router.get("/roteiros2/:id/pontos", buscarRoteiroESeusPontos);
router.get("/pontos-extras/:roteiro_id", buscarPontosExtras);
router.get("/cidade-imagem", buscarImagemCidade);


module.exports = router;
