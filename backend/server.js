// server.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
const port = 5001;

// ---------------------------------------------
// CONFIGURAÇÃO BÁSICA
// ---------------------------------------------
app.use(cors());
app.use(express.json());

// ---------------------------------------------
// CONSTANTES / ARQUIVOS
// ---------------------------------------------
const SECRET_KEY = "12345678910";
const ADMIN_EMAIL = "passabola@fiap"; // único admin

// Pastas/arquivos de dados
const dataDir = path.join(__dirname, "data");
const usuariosPath = path.join(dataDir, "usuarios.json");
const campeonatosPath = path.join(dataDir, "campeonatos.json");
const treinosPath = path.join(dataDir, "treinos.json");

// Garante pasta/arquivos básicos
function ensureData() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(usuariosPath)) fs.writeFileSync(usuariosPath, "[]");
  if (!fs.existsSync(campeonatosPath)) fs.writeFileSync(campeonatosPath, "[]");
  if (!fs.existsSync(treinosPath)) fs.writeFileSync(treinosPath, "[]");
}
ensureData();

// Helpers de leitura/escrita seguros
function readJSON(file) {
  try {
    const raw = fs.readFileSync(file, "utf-8");
    return JSON.parse(raw || "[]");
  } catch {
    fs.writeFileSync(file, "[]");
    return [];
  }
}
function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// ---------------------------------------------
// AUTH: REGISTER / LOGIN
// ---------------------------------------------
app.post("/register", async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json({ message: "Campos obrigatórios" });
    }

    const users = readJSON(usuariosPath);
    if (users.find((u) => (u.email || "").toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ message: "Email já cadastrado no banco de dados" });
    }

    const hash = await bcrypt.hash(senha, 10);
    const novo = { id: Date.now(), email, senha: hash };
    users.push(novo);
    writeJSON(usuariosPath, users);

    return res.status(200).json({ message: "Usuário registrado com sucesso" });
  } catch (err) {
    console.error("Erro /register:", err);
    return res.status(500).json({ message: "Erro interno ao registrar usuário" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, senha, tipo } = req.body || {};
    const users = readJSON(usuariosPath);
    const user = users.find(
      (u) => (u.email || "").toLowerCase() === (email || "").toLowerCase()
    );

    if (!user) return res.status(400).json({ message: "Usuário/senha inválidos" });

    const ok = await bcrypt.compare(senha, user.senha);
    if (!ok) return res.status(400).json({ message: "Senha inválida" });

    // Regra: admin só entra como admin; player nunca entra como admin
    if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      if (tipo !== "admin") {
        return res.status(403).json({ message: "O administrador deve entrar no modo Administrador" });
      }
    } else {
      if (tipo === "admin") {
        return res.status(403).json({ message: "Este email não tem permissão de administrador" });
      }
    }

    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: "10m" });
    return res.json({ message: "Login realizado com sucesso", token });
  } catch (err) {
    console.error("Erro /login:", err);
    return res.status(500).json({ message: "Erro interno ao realizar login" });
  }
});

// ---------------------------------------------
// MIDDLEWARE & UTILS
// ---------------------------------------------
function autenticaToken(req, res, next) {
  const auth = req.headers["authorization"];
  const token = auth && auth.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (erro, user) => {
    if (erro) return res.sendStatus(403);
    req.user = user;
    next();
  });
}
const isAdmin = (req) => (req.user?.email || "").toLowerCase() === ADMIN_EMAIL.toLowerCase();

// ---------------------------------------------
// ROTA DE TESTE
// ---------------------------------------------
app.get("/dashboard", autenticaToken, (req, res) => {
  res.json({ message: "Acesso autorizado, Bem-vindo", user: req.user });
});

// ---------------------------------------------
// CAMPEONATOS / TIMES / JOGADORAS
// ---------------------------------------------
const POSICOES = ["Goleira", "Defesa", "Meio-campo", "Ataque"];
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const consultarCampeonatos = () => readJSON(campeonatosPath);
const salvarCampeonatos = (d) => writeJSON(campeonatosPath, d);

// Listar (público)
app.get("/campeonatos", (_req, res) => res.json(consultarCampeonatos()));

// Criar campeonato (somente admin) — agora com idade mínima/máxima
app.post("/campeonatos", autenticaToken, (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ message: "Apenas o administrador pode criar campeonatos" });
  const { nome, idadeMin, idadeMax } = req.body;
  if (!nome) return res.status(400).json({ message: "O nome do campeonato é obrigatório" });

  const min = Number(idadeMin);
  const max = Number(idadeMax);
  if (!Number.isInteger(min) || !Number.isInteger(max) || min <= 0 || max <= 0 || min > max) {
    return res.status(400).json({ message: "Faixa etária inválida. Informe inteiros positivos (min <= max)." });
  }

  const db = consultarCampeonatos();
  const novo = { id: uid(), nome, idadeMin: min, idadeMax: max, times: [] };
  db.push(novo);
  salvarCampeonatos(db);
  res.status(201).json({ message: "Campeonato criado com sucesso", campeonato: novo });
});

// Editar campeonato (somente admin)
app.put("/campeonatos/:campId", autenticaToken, (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ message: "Apenas admin pode editar campeonatos" });
  const { campId } = req.params;
  const { nome, idadeMin, idadeMax } = req.body;

  const db = consultarCampeonatos();
  const camp = db.find((c) => c.id === campId);
  if (!camp) return res.status(404).json({ message: "Campeonato não encontrado" });

  if (nome) camp.nome = nome;
  if (idadeMin !== undefined || idadeMax !== undefined) {
    const min = idadeMin !== undefined ? Number(idadeMin) : camp.idadeMin;
    const max = idadeMax !== undefined ? Number(idadeMax) : camp.idadeMax;
    if (!Number.isInteger(min) || !Number.isInteger(max) || min <= 0 || max <= 0 || min > max) {
      return res.status(400).json({ message: "Faixa etária inválida. Informe inteiros positivos (min <= max)." });
    }
    camp.idadeMin = min;
    camp.idadeMax = max;
  }

  salvarCampeonatos(db);
  res.json(camp);
});

// Excluir campeonato (somente admin)
app.delete("/campeonatos/:campId", autenticaToken, (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ message: "Apenas admin pode excluir campeonatos" });
  const { campId } = req.params;

  const db = consultarCampeonatos();
  const idx = db.findIndex((c) => c.id === campId);
  if (idx === -1) return res.status(404).json({ message: "Campeonato não encontrado" });

  const [removido] = db.splice(idx, 1);
  salvarCampeonatos(db);
  res.json(removido);
});

// Criar time — AGORA: somente admin pode criar time manualmente
app.post("/campeonatos/:campId/times", autenticaToken, (req, res) => {
  if (!isAdmin(req)) {
    return res.status(403).json({ message: "Apenas o administrador pode criar times" });
  }

  const { campId } = req.params;
  const db = consultarCampeonatos();
  const camp = db.find((c) => c.id === campId);
  if (!camp) return res.status(404).json({ message: "Campeonato não encontrado" });

  const nome = `Time ${camp.times.length + 1}`;
  const time = { id: uid(), nome, dono: null, jogadoras: [] }; // dono null (criado pela organização/admin)
  camp.times.push(time);
  salvarCampeonatos(db);
  res.status(201).json(time);
});

// Editar time (somente admin)
app.put("/campeonatos/:campId/times/:timeId", autenticaToken, (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ message: "Apenas admin pode editar times" });
  const { campId, timeId } = req.params;
  const { nome } = req.body;

  const db = consultarCampeonatos();
  const camp = db.find((c) => c.id === campId);
  if (!camp) return res.status(404).json({ message: "Campeonato não encontrado" });
  const time = camp.times.find((t) => t.id === timeId);
  if (!time) return res.status(404).json({ message: "Time não encontrado" });

  if (nome) time.nome = nome;
  salvarCampeonatos(db);
  res.json(time);
});

// Excluir time (somente admin)
app.delete("/campeonatos/:campId/times/:timeId", autenticaToken, (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ message: "Apenas admin pode excluir times" });
  const { campId, timeId } = req.params;

  const db = consultarCampeonatos();
  const camp = db.find((c) => c.id === campId);
  if (!camp) return res.status(404).json({ message: "Campeonato não encontrado" });
  const idx = camp.times.findIndex((t) => t.id === timeId);
  if (idx === -1) return res.status(404).json({ message: "Time não encontrado" });

  const [removido] = camp.times.splice(idx, 1);
  salvarCampeonatos(db);
  res.json(removido);
});

// Adicionar jogadora (dono do time OU admin) — limite 15, número único
app.post("/campeonatos/:campId/times/:timeId/jogadoras", autenticaToken, (req, res) => {
  const { campId, timeId } = req.params;
  const { nome, posicao, numero } = req.body;
  const email = (req.user?.email || "").toLowerCase();

  if (!nome || !posicao || numero === undefined) {
    return res.status(400).json({ message: "nome, posicao e numero são obrigatórios" });
  }
  if (!POSICOES.includes(posicao)) return res.status(400).json({ message: "Posição inválida" });

  const db = consultarCampeonatos();
  const camp = db.find((c) => c.id === campId);
  if (!camp) return res.status(404).json({ message: "Campeonato não encontrado" });
  const time = camp.times.find((t) => t.id === timeId);
  if (!time) return res.status(404).json({ message: "Time não encontrado" });

  // Admin pode gerenciar (adicionar/editar/excluir jogadoras)
  // Dono do time também pode adicionar (se houver dono)
  if (!isAdmin(req) && (time.dono || "") !== email) {
    return res.status(403).json({ message: "Somente o dono do time ou admin podem adicionar jogadoras" });
  }

  if (time.jogadoras.length >= 15) return res.status(400).json({ message: "Limite de 15 jogadoras por time atingido" });

  const numeroInt = Number(numero);
  if (!Number.isInteger(numeroInt) || numeroInt <= 0) return res.status(400).json({ message: "Número da camisa inválido" });
  if (time.jogadoras.some((j) => j.numero === numeroInt)) {
    return res.status(400).json({ message: "Número de camisa já usado nesse time" });
  }

  const jogadora = { id: uid(), nome, posicao, numero: numeroInt };
  time.jogadoras.push(jogadora);
  salvarCampeonatos(db);
  res.status(201).json(jogadora);
});

// Editar jogadora (somente admin)
app.put("/campeonatos/:campId/times/:timeId/jogadoras/:jogId", autenticaToken, (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ message: "Apenas admin pode editar jogadoras" });
  const { campId, timeId, jogId } = req.params;
  const { nome, posicao, numero } = req.body;

  const db = consultarCampeonatos();
  const camp = db.find((c) => c.id === campId);
  if (!camp) return res.status(404).json({ message: "Campeonato não encontrado" });
  const time = camp.times.find((t) => t.id === timeId);
  if (!time) return res.status(404).json({ message: "Time não encontrado" });
  const jog = time.jogadoras.find((j) => j.id === jogId);
  if (!jog) return res.status(404).json({ message: "Jogadora não encontrada" });

  if (posicao && !POSICOES.includes(posicao)) return res.status(400).json({ message: "Posição inválida" });

  if (nome) jog.nome = nome;
  if (posicao) jog.posicao = posicao;
  if (numero !== undefined) {
    const numeroInt = Number(numero);
    if (!Number.isInteger(numeroInt) || numeroInt <= 0) return res.status(400).json({ message: "Número da camisa inválido" });
    if (time.jogadoras.some((j) => j.id !== jog.id && j.numero === numeroInt)) {
      return res.status(400).json({ message: "Número de camisa já usado nesse time" });
    }
    jog.numero = numeroInt;
  }

  salvarCampeonatos(db);
  res.json(jog);
});

// Excluir jogadora (somente admin)
app.delete("/campeonatos/:campId/times/:timeId/jogadoras/:jogId", autenticaToken, (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ message: "Apenas admin pode excluir jogadoras" });
  const { campId, timeId, jogId } = req.params;

  const db = consultarCampeonatos();
  const camp = db.find((c) => c.id === campId);
  if (!camp) return res.status(404).json({ message: "Campeonato não encontrado" });
  const time = camp.times.find((t) => t.id === timeId);
  if (!time) return res.status(404).json({ message: "Time não encontrado" });
  const idx = time.jogadoras.findIndex((j) => j.id === jogId);
  if (idx === -1) return res.status(404).json({ message: "Jogadora não encontrada" });

  const [removida] = time.jogadoras.splice(idx, 1);
  salvarCampeonatos(db);
  res.json(removida);
});

// Inscrição sozinha (qualquer usuário logado EXCETO admin), com validação de idade
app.post("/campeonatos/:campId/inscrever-solo", autenticaToken, (req, res) => {
  const { campId } = req.params;
  const { nome, posicao, numero, idade } = req.body;
  const email = (req.user?.email || "").toLowerCase();

  if (email === ADMIN_EMAIL.toLowerCase()) {
    return res.status(403).json({ message: "Admin não pode se inscrever (somente gerenciar)" });
  }

  if (!nome || !posicao || numero === undefined || idade === undefined) {
    return res.status(400).json({ message: "nome, posicao, numero e idade são obrigatórios" });
  }
  if (!POSICOES.includes(posicao)) return res.status(400).json({ message: "Posição inválida" });

  const idadeInt = Number(idade);
  if (!Number.isInteger(idadeInt) || idadeInt <= 0) {
    return res.status(400).json({ message: "Idade inválida" });
  }

  const db = consultarCampeonatos();
  const camp = db.find((c) => c.id === campId);
  if (!camp) return res.status(404).json({ message: "Campeonato não encontrado" });

  // Validação de idade contra faixa do campeonato
  if (camp.idadeMin !== undefined && camp.idadeMax !== undefined) {
    if (idadeInt < camp.idadeMin || idadeInt > camp.idadeMax) {
      return res.status(400).json({
        message: `Você não atende ao requisito de idade deste campeonato (Permitido: ${camp.idadeMin} a ${camp.idadeMax} anos).`
      });
    }
  }

  // Tenta time com vaga; senão cria novo pertencente ao sistema (dono null)
  let candidato = camp.times.filter((t) => t.jogadoras.length < 15);
  let time = null;
  if (candidato.length > 0) {
    time = candidato[Math.floor(Math.random() * candidato.length)];
  } else {
    time = { id: uid(), nome: `Time ${camp.times.length + 1}`, dono: null, jogadoras: [] };
    camp.times.push(time);
  }

  const numeroInt = Number(numero);
  if (!Number.isInteger(numeroInt) || numeroInt <= 0) return res.status(400).json({ message: "Número da camisa inválido" });
  if (time.jogadoras.some((j) => j.numero === numeroInt)) {
    return res.status(400).json({ message: "Número de camisa já usado no time escolhido" });
  }

  const jogadora = { id: uid(), nome, posicao, numero: numeroInt, idade: idadeInt };
  time.jogadoras.push(jogadora);
  salvarCampeonatos(db);
  res.status(201).json({ timeId: time.id, timeNome: time.nome, jogadora });
});

// ---------------------------------------------
// START
// ---------------------------------------------
app.listen(port, () => {
  console.log(`✅ Servidor rodando http://localhost:${port}`);
});
