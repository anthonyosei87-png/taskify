const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Database Connection Pool with SSL requirements for Railway
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,      
    password: process.env.DB_PASSWORD,      
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
        rejectUnauthorized: false
    }
});

// Simple startup status validation
db.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed:', err.message);
    } else {
        console.log('Successfully verified active live connection pool.');
        connection.release();
    }
});

// GET all tasks (Removed ORDER BY created_at to avoid database column errors)
app.get('/api/tasks', (req, res) => {
    db.query('SELECT * FROM tasks', (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// POST a new task
app.post('/api/tasks', (req, res) => {
    const { title, description } = req.body;
    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }
    
    db.query('INSERT INTO tasks (title, description) VALUES (?, ?)', [title, description], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: result.insertId, title, description, is_completed: 0 });
    });
});

// PUT (Toggle complete status)
app.put('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    const { is_completed } = req.body;
    
    db.query('UPDATE tasks SET is_completed = ? WHERE id = ?', [is_completed, id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Task updated successfully' });
    });
});

// DELETE a task
app.delete('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    
    db.query('DELETE FROM tasks WHERE id = ?', [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Task deleted successfully' });
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
