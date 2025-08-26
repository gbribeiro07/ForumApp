const express = require('express');
const app = express();
const pool = require('./db');
const authRoutes = require('./src/routes/authRoutes');
const postRoutes = require('./src/routes/postRoutes');
const commentRoutes = require('./src/routes/commentRoutes');
const userRoutes = require('./src/routes/userRoutes');
const uploadRoutes = require('./src/routes/uploadRoutes');
const path = require('path');
const cors = require('cors');
const PORT = process.env.PORT || 3001;
const os = require('os');

// Função para obter o endereço IP local
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (!iface.internal && iface.family === 'IPv4') {
        return iface.address;
      }
    }
  }
  return '0.0.0.0'; // Fallback
}

const localIp = getLocalIpAddress();

app.use(cors({
  origin: '*', // Permite acesso de qualquer origem (em produção, especifique seus domínios)
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' })); // Aumentando o limite para uploads maiores

app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes); 
app.use('/api/comments', commentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);

// Rota de exemplo (pode ser removida depois)
app.get('/', (req, res) => {
  res.send('Bem-vindo à API do Fórum!');
});

// Rota para teste de conexão
app.get('/api/test-connection', (req, res) => {
  res.status(200).json({ 
    message: 'Conexão bem-sucedida!',
    serverIp: localIp,
    timestamp: new Date().toISOString()
  });
});

// Exemplo de como usar a conexão (apenas para teste inicial)
app.get('/test-db', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS solution');
    res.json({ message: 'Conexão com DB bem-sucedida!', solution: rows[0].solution });
  } catch (error) {
    console.error('Erro na rota /test-db:', error);
    res.status(500).json({ message: 'Erro ao conectar ao banco de dados', error: error.message });
  }
});

// Inicia o servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesse localmente: http://localhost:${PORT}`);
  console.log(`Acesse na rede: http://${localIp}:${PORT}`);
  console.log(`Testar imagem: http://${localIp}:${PORT}/uploads/post_images/`);
});