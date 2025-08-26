const pool = require('../../db');

// Obter comentários de um post específico
exports.getCommentsByPostId = async (req, res) => {
  const { postId } = req.params;
  try {
    const [rows] = await pool.query(`
      SELECT
          c.id, c.content, c.created_at,
          u.id AS user_id, u.username, u.profile_picture_url
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC
    `, [postId]);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao buscar comentários:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar comentários.' });
  }
};

// Criar um novo comentário em um post
exports.createComment = async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;
  const userId = req.user.id; // ID do usuário autenticado

  if (!content) {
    return res.status(400).json({ message: 'O conteúdo do comentário não pode ser vazio.' });
  }

  try {
    // Verificar se o post existe
    const [post] = await pool.query('SELECT id FROM posts WHERE id = ?', [postId]);
    if (post.length === 0) {
      return res.status(404).json({ message: 'Post não encontrado.' });
    }
    
    // Inserir o comentário
    const [result] = await pool.query(
      'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
      [postId, userId, content]
    );
    
    // Buscar o comentário recém-criado com os dados do usuário
    const [newComment] = await pool.query(`
      SELECT
          c.id, c.content, c.created_at,
          u.id AS user_id, u.username, u.profile_picture_url
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `, [result.insertId]);
    
    res.status(201).json({ 
      message: 'Comentário adicionado com sucesso!', 
      comment: newComment[0] 
    });
  } catch (error) {
    console.error('Erro ao criar comentário:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao criar comentário.' });
  }
};

// Atualizar um comentário existente (apenas o próprio autor pode editar)
exports.updateComment = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const userId = req.user.id;

  if (!content) {
    return res.status(400).json({ message: 'O conteúdo do comentário não pode ser vazio.' });
  }

  try {
    // Verificar se o comentário existe e pertence ao usuário atual
    const [comment] = await pool.query('SELECT user_id FROM comments WHERE id = ?', [id]);
    
    if (comment.length === 0) {
      return res.status(404).json({ message: 'Comentário não encontrado.' });
    }
    
    if (comment[0].user_id !== userId) {
      return res.status(403).json({ message: 'Você não tem permissão para editar este comentário.' });
    }
    
    // Atualizar o comentário
    await pool.query(
      'UPDATE comments SET content = ? WHERE id = ?',
      [content, id]
    );
    
    // Buscar o comentário atualizado com os dados do usuário
    const [updatedComment] = await pool.query(`
      SELECT
          c.id, c.content, c.created_at,
          u.id AS user_id, u.username, u.profile_picture_url
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `, [id]);
    
    res.status(200).json({ 
      message: 'Comentário atualizado com sucesso!',
      comment: updatedComment[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar comentário:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao atualizar comentário.' });
  }
};

// Excluir um comentário (apenas o próprio autor pode excluir)
exports.deleteComment = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // Verificar se o comentário existe e pertence ao usuário atual
    const [comment] = await pool.query('SELECT user_id FROM comments WHERE id = ?', [id]);
    
    if (comment.length === 0) {
      return res.status(404).json({ message: 'Comentário não encontrado.' });
    }
    
    if (comment[0].user_id !== userId) {
      return res.status(403).json({ message: 'Você não tem permissão para excluir este comentário.' });
    }
    
    // Excluir o comentário
    await pool.query('DELETE FROM comments WHERE id = ?', [id]);
    
    res.status(200).json({ message: 'Comentário excluído com sucesso!' });
  } catch (error) {
    console.error('Erro ao excluir comentário:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao excluir comentário.' });
  }
};