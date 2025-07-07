const pool = require('../Config/Db');
const bcrypt = require('bcryptjs');
//npm i bcrypt

const jwt = require('jsonwebtoken');
const jwtsecret = process.env.JWT_SECRET || 'senhajwt'

//obter as infos do usuário logado (usado no perfil)
exports.getMe = async (req, res) => {
    const userId = req.user.id //id vem do middleware

    try {
        const [rows] = await pool.query(
            'SELECT id, username, email, profile_picture_url, created-at FROM users WHERE id = ?', [userId]
        )
        if (rows.length === 0) {
            return res.status(404).json({message: 'Usuário não encontrado'})
        }
        //caso encontrado buscamos o primeiro indice do SELECT
        res.status(200).json(rows[0])
    } catch (error) {
        console.error('Erro ao buscar infos do usuário', error);
        res.status(500).json({message: 'Erro interno do server'})
    }
};

