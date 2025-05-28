const express = require("express");
const router = express.Router();
const { registerUser, loginUser,atualizarPerfil, obterPerfil, alterarSenha } = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/perfil/:id", atualizarPerfil);
router.get("/perfil/:id", obterPerfil);
router.put("/alterar-senha/:id", alterarSenha);

module.exports = router;
