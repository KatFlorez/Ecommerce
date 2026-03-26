const mysql = require('mysql2/promise');

function getEnv(name, fallback) {
  return process.env[name] ?? fallback;
}

const pool = mysql.createPool({
  host: getEnv('DB_HOST', '127.0.0.1'),
  port: Number(getEnv('DB_PORT', '8889')),
  user: getEnv('DB_USERNAME', 'root'),
  password: getEnv('DB_PASSWORD', 'root'),
  database: getEnv('DB_DATABASE', 'dboEcommerce'),
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true
});

async function query(sql, params) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

module.exports = {
  pool,
  query
};

