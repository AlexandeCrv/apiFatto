const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("./database.db");

// Criação da tabela se não existir
db.run(`
  CREATE TABLE IF NOT EXISTS tarefas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT UNIQUE NOT NULL,
    custo REAL NOT NULL,
    data_limite TEXT NOT NULL,
    ordem_apresentacao INTEGER UNIQUE NOT NULL
  );
`);

// Rota pra listar todas as tarefas
app.get("/tarefas", (req, res) => {
  db.all(
    "SELECT * FROM tarefas ORDER BY ordem_apresentacao",
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Rota pra criar nova tarefa
app.post("/tarefas", (req, res) => {
  const { nome, custo, data_limite } = req.body;
  db.run(
    `INSERT INTO tarefas (nome, custo, data_limite, ordem_apresentacao) 
     VALUES (?, ?, ?, (SELECT COALESCE(MAX(ordem_apresentacao), 0) + 1 FROM tarefas))`,
    [nome, custo, data_limite],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

// Rota pra atualizar uma tarefa
app.put("/tarefas/:id", (req, res) => {
  const { id } = req.params;
  const { nome, custo, data_limite } = req.body;

  db.run(
    `UPDATE tarefas SET nome = ?, custo = ?, data_limite = ? WHERE id = ?`,
    [nome, custo, data_limite, id],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ message: "Tarefa atualizada com sucesso" });
    }
  );
});

// Rota pra excluir uma tarefa
app.delete("/tarefas/:id", (req, res) => {
  const { id } = req.params;

  db.run(`DELETE FROM tarefas WHERE id = ?`, id, function (err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ message: "Tarefa excluída com sucesso" });
  });
});

app.listen(PORT, () => console.log(`Backend rodando na porta ${PORT}`));
