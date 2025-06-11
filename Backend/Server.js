const express = require("express");
const app = express();
const PORT = process.env.PORT || 3001;
const mysql = require("./Config/Db");

// Middleware para parsear JSON no corpo das requisições
app.use(express.json());

// Rota de exemplo
app.get("/", (req, res) => {
  res.send("Bem-vindo à API do Fórum!");
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesse: http://localhost:${PORT}`);
});
