const pool = require("../config/db");
const jwt = require("jsonwebtoken");

async function registerUser(req, res) {
  const { name, email, phone, password } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO users (name, email, phone, password) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, email, phone, password]
    );

    res.status(201).json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Erro ao registrar usuário" });
  }
}

async function loginUser(req, res) {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Usuário não encontrado" });
    }

    const user = result.rows[0];
    if (user.password !== password) {
      return res.status(401).json({ error: "Senha incorreta" });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ message: "Login bem-sucedido", token, userName: user.name, userId: user.id });
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
}

module.exports = { registerUser, loginUser };
