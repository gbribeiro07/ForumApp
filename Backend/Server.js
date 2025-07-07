const express = require("express");
const app = express();
const pool = require("./db");
const authRoutes = require("./Routes/authRoutes");
const postRoutes = require("./Routes/postRoutes");
const commentRoutes = require("./Routes/commentRoutes");
const userRoutes = require("./Routes/userRoutes");
const uploadRoutes = require("./Routes/uploadRoutes");
const path = require("path");
const cors = require("cors");
const PORT = process.env.PORT || 3001

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/', (req, res) => {
    res.send("Bem vindo à API")
})

app.listen(PORT, () => {
  console.log(`Servidor rodando OK`);
  console.log(`Acesse: http:/localhost:${PORT}`);
})