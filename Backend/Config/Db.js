const mysql = require("mysql2");
require("dotenv").config();

// Cria uma conexão com o banco de dados
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Tenta se conectar ao banco de dados
connection.connect((err) => {
  if (err) {
    console.error("Erro ao conectar ao MySQL:", err.message);
  } else {
    console.log("Conectado ao MySQL com mysql2!");
  }
});

// Exporta a conexão para ser usada em outros arquivos
module.exports = connection;
