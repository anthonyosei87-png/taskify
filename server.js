const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json()); 

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',      
    password: '',      
    database: 'taskify_db'
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL database.');
});


app.get('/api/tasks', (req, res) => {
    const sql = "SELECT * FROM tasks ORDER BY created_at DESC";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/api/tasks', (req, res) => {
    const { title, description } = req.body;

    if (!title || title.trim() === "") {
        return res.status(400).json({ error: "Task title is required." });
    }

    const sql = "INSERT INTO tasks (title, description) VALUES (?, ?)";
    db.query(sql, [title, description], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: result.insertId, title, description, is_completed: 0 });
    });
});

app.put('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    const { is_completed } = req.body;

    const sql = "UPDATE tasks SET is_completed = ? WHERE id = ?";
    db.query(sql, [is_completed, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Task updated successfully." });
    });
});

app.delete('/api/tasks/:id', (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM tasks WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Task deleted successfully." });
    });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});