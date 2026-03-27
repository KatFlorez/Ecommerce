require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { query } = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Aseguramos la tabla necesaria para el CRUD.
// Así evitas que falle si todavía no la creaste en MySQL.
async function ensureSchema() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(120) NOT NULL,
      apellido VARCHAR(120) NOT NULL,
      correo VARCHAR(200) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Si la tabla existía desde antes sin "apellido", intentamos agregarla.
  // Si ya existe la columna, simplemente ignoramos ese error.
  try {
    await query('ALTER TABLE users ADD COLUMN apellido VARCHAR(120) NOT NULL DEFAULT "" AFTER nombre');
  } catch (err) {
    const msg = String(err?.message || err);
    if (!msg.toLowerCase().includes('duplicate column')) {
      throw err;
    }
  }
}

ensureSchema().catch((err) => {
  console.error('Error creando esquema (schema) para users:', err?.message || err);
});

// Healthcheck para probar que el servidor está vivo.
app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// ====== STATS (dashboard) ======
app.get('/api/stats', async (_req, res) => {
  try {
    const usersCountRows = await query(
      'SELECT COUNT(*) AS count FROM users'
    );
    const usersCount = usersCountRows?.[0]?.count ?? 0;

    // Usuarios creados por día (últimos 7 días)
    const series = await query(
      `SELECT DATE(created_at) AS day, COUNT(*) AS count
       FROM users
       WHERE created_at >= (NOW() - INTERVAL 6 DAY)
       GROUP BY DATE(created_at)
       ORDER BY day ASC`
    );

    res.json({
      usersCount,
      createdSeries: series
        .map((r) => ({ day: String(r.day), count: Number(r.count) }))
    });
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo stats', details: String(err.message || err) });
  }
});

// ====== USERS CRUD ======
app.get('/api/users', async (_req, res) => {
  try {
    const rows = await query(
      'SELECT id, nombre, apellido, correo, created_at FROM users ORDER BY id DESC'
    );
    res.json({ users: rows });
  } catch (err) {
    res.status(500).json({ error: 'Error listando usuarios', details: String(err.message || err) });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { nombre, apellido, correo, password } = req.body || {};
    if (!nombre || !apellido || !correo || !password) {
      return res.status(400).json({ error: 'nombre, apellido, correo y password son requeridos' });
    }

    await query(
      'INSERT INTO users (nombre, apellido, correo, password) VALUES (?, ?, ?, ?)',
      [nombre, apellido, correo, password]
    );
    // mysql2/promise pool.execute devuelve rows, pero para INSERT necesitamos el result de execute.
    // Para simplificar, hacemos un INSERT con query del pool (db.js usa pool.execute).
    // Aquí asumimos que result.insertId está presente según driver.

    res.status(201).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error creando usuario', details: String(err.message || err) });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, correo, password } = req.body || {};
    if (!id || !nombre || !apellido || !correo || !password) {
      return res.status(400).json({ error: 'id, nombre, apellido, correo y password son requeridos' });
    }

    await query(
      'UPDATE users SET nombre = ?, apellido = ?, correo = ?, password = ? WHERE id = ?',
      [nombre, apellido, correo, password, id]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error actualizando usuario', details: String(err.message || err) });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'id es requerido' });
    }

    await query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error eliminando usuario', details: String(err.message || err) });
  }
});

// ====== LOGIN BÁSICO ======
app.post('/api/login', async (req, res) => {
  try {
    const { correo, password } = req.body || {};
    if (!correo || !password) {
      return res.status(400).json({ error: 'correo y password son requeridos' });
    }

    const rows = await query(
      'SELECT id, nombre, apellido, correo FROM users WHERE correo = ? AND password = ? LIMIT 1',
      [correo, password]
    );

    const user = rows?.[0];
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    res.json({ ok: true, user });
  } catch (err) {
    res.status(500).json({ error: 'Error en login', details: String(err.message || err) });
  }
});

const PORT = Number(process.env.PORT ?? 3001);
app.listen(PORT, () => {
  console.log(`Backend escuchando en http://localhost:${PORT}`);
});

