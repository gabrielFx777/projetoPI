const pool = require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Define o número de rounds para gerar o salt (quanto maior, mais seguro, mas mais lento)
const SALT_ROUNDS = 10;
const MAX_ATTEMPTS = 3;
const BLOCK_TIME_MINUTES = 30;

async function registerUser(req, res) {
  const { name, email, phone, password } = req.body;

  try {
    // Verifica se o e-mail já existe
    const emailExists = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (emailExists.rows.length > 0) {
      return res
        .status(400)
        .json({ success: false, error: "E-mail já cadastrado." });
    }

    // Criptografa a senha
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await pool.query(
      "INSERT INTO users (name, email, phone, password) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, email, phone, hashedPassword]
    );

    res.status(201).json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, error: "Erro ao registrar usuário" });
  }
}

async function loginUser(req, res) {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Usuário não encontrado" });
    }

    const user = result.rows[0];

    // Verifica se usuário está bloqueado
    if (user.login_attempts >= MAX_ATTEMPTS) {
      const lastAttempt = new Date(user.last_failed_login);
      const agora = new Date();
      const diff = (agora - lastAttempt) / (1000 * 60); // em minutos

      if (diff < BLOCK_TIME_MINUTES) {
        const minutosRestantes = Math.ceil(BLOCK_TIME_MINUTES - diff);
        return res.status(429).json({
          error: `Conta bloqueada. Tente novamente em ${minutosRestantes} minuto(s)`,
        });
      } else {
        // Libera o login após o tempo
        await pool.query(
          "UPDATE users SET login_attempts = 0, last_failed_login = NULL WHERE id = $1",
          [user.id]
        );
      }
    }

    const senhaCorreta = await bcrypt.compare(password, user.password);

    if (!senhaCorreta) {
      await pool.query(
        "UPDATE users SET login_attempts = login_attempts + 1, last_failed_login = NOW() WHERE id = $1",
        [user.id]
      );
      return res.status(401).json({ error: "Senha incorreta" });
    }

    // Login correto, reseta tentativas
    await pool.query(
      "UPDATE users SET login_attempts = 0, last_failed_login = NULL WHERE id = $1",
      [user.id]
    );

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({
      message: "Login bem-sucedido",
      token,
      userName: user.name,
      userId: user.id,
    });
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
}

async function atualizarPerfil(req, res) {
  const { id } = req.params;
  const { name, email, phone } = req.body;

  try {
    await pool.query(
      "UPDATE users SET name = $1, email = $2, phone = $3 WHERE id = $4",
      [name, email, phone, id]
    );

    res.status(200).json({ message: "Perfil atualizado com sucesso!" });
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    res.status(500).json({ error: "Erro ao atualizar perfil" });
  }
}

async function obterPerfil(req, res) {
  const { id } = req.params;

  try {
    const resultado = await pool.query(
      "SELECT id, name, email, phone FROM users WHERE id = $1",
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    res.status(200).json(resultado.rows[0]);
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    res.status(500).json({ error: "Erro ao buscar perfil" });
  }
}

async function alterarSenha(req, res) {
  const { id } = req.params;
  const { senhaAtual, novaSenha } = req.body;

  try {
    // Busca o usuário
    const resultado = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const usuario = resultado.rows[0];

    // Verifica se a senha atual está correta
    const senhaCorreta = await bcrypt.compare(senhaAtual, usuario.password);
    if (!senhaCorreta) {
      return res.status(401).json({ error: "Senha atual incorreta" });
    }

    // Criptografa a nova senha
    const novaSenhaCriptografada = await bcrypt.hash(novaSenha, 10);

    // Atualiza no banco
    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [
      novaSenhaCriptografada,
      id,
    ]);

    res.status(200).json({ message: "Senha atualizada com sucesso!" });
  } catch (error) {
    console.error("Erro ao alterar senha:", error);
    res.status(500).json({ error: "Erro ao alterar senha" });
  }
}

module.exports = { registerUser, loginUser, atualizarPerfil, obterPerfil, alterarSenha };
