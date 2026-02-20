const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());

// Serve frontend folder
app.use(express.static(path.join(__dirname, "..", "frontend")));
app.use(express.json());

const db = new sqlite3.Database(
  path.join(__dirname, "cards.db"),
  (err) => {
    if (err) {
      console.error("Database connection error:", err.message);
    } else {
      console.log("Connected to SQLite database.");
    }
  },
);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      image TEXT NOT NULL
    )
  `);

  db.get("SELECT COUNT(*) as count FROM cards", (err, row) => {
    if (err) {
      console.error(err);
      return;
    }

    if (row && row.count === 0) {
      db.run(`
        INSERT INTO cards (name, image) VALUES
        ('Rocket', 'images/rocket.jpg'),
        ('Moon', 'images/moon.jpg'),
        ('Star', 'images/star.jpg'),
        ('Comet', 'images/comet.jpg'),
        ('Sun', 'images/sun.jpg'),
        ('Planets', 'images/planets.jpg')
      `);
      console.log("Inserted default cards.");
    }
  });
});

app.get("/api/cards", (req, res) => {
  db.all("SELECT * FROM cards", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
