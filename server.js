// backend/server.js
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const dbPath = path.join(__dirname, '../database/tastybites.db');
const db = new sqlite3.Database(dbPath);

// Create tables if not exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstName TEXT,
    surname TEXT,
    middleName TEXT,
    dob TEXT,
    homeAddress TEXT,
    registrationDate TEXT,
    devFlag BOOLEAN
  )`);
});

// Get all customers
app.get('/customers', (req, res) => {
  db.all('SELECT * FROM customers', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Add customer
app.post('/customers', (req, res) => {
  const c = req.body;
  db.run(`INSERT INTO customers (firstName, surname, middleName, dob, homeAddress, registrationDate, devFlag)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [c.firstName, c.surname, c.middleName, c.dob, c.homeAddress, c.registrationDate, c.devFlag],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});

