const express = require("express");
const cors = require("cors");
require("./config/dotenv");
const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Conexão com o banco (apenas para ativar pool global)
require("./config/db");

// Rotas
const authRoutes = require("./routes/authRoutes");
const roteiroRoutes = require("./routes/roteiroRoutes");
const climaRoutes = require("./routes/climaRoutes");
const imagemRoutes = require("./routes/imagemRoutes");

app.use("/api", authRoutes);
app.use("/api", roteiroRoutes);
app.use("/api", climaRoutes);
app.use("/api", imagemRoutes);

// Inicialização
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

