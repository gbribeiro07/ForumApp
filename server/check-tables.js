const pool = require('./db');

async function checkTables() {
  try {
    // Verifica as tabelas existentes
    const [tables] = await pool.query('SHOW TABLES');
    console.log('Tabelas existentes:', tables);

    // Verifica a estrutura da tabela users
    if (tables.length > 0) {
      for (const tableObj of tables) {
        const tableName = tableObj[Object.keys(tableObj)[0]];
        console.log(`\nEstrutura da tabela ${tableName}:`);
        const [columns] = await pool.query(`DESCRIBE ${tableName}`);
        console.log(columns);
      }
    } else {
      console.log('Nenhuma tabela encontrada. Criando tabelas necessárias...');
      await createTables();
    }

    process.exit(0);
  } catch (error) {
    console.error('Erro ao verificar tabelas:', error);
    process.exit(1);
  }
}

async function createTables() {
  try {
    // Criar tabela users
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        profile_picture_url VARCHAR(255),
        bio TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Tabela users criada com sucesso');

    // Criar tabela posts
    await pool.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        image_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('Tabela posts criada com sucesso');

    // Criar tabela comments
    await pool.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        post_id INT NOT NULL,
        user_id INT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('Tabela comments criada com sucesso');

    // Criar tabela likes
    await pool.query(`
      CREATE TABLE IF NOT EXISTS likes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        post_id INT NOT NULL,
        user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_like (post_id, user_id)
      )
    `);
    console.log('Tabela likes criada com sucesso');

    // Criar tabela favorites
    await pool.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id INT AUTO_INCREMENT PRIMARY KEY,
        post_id INT NOT NULL,
        user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_favorite (post_id, user_id)
      )
    `);
    console.log('Tabela favorites criada com sucesso');

  } catch (error) {
    console.error('Erro ao criar tabelas:', error);
    throw error;
  }
}

checkTables();
