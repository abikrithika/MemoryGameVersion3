const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());

// Serve frontend folder
app.use(express.static(path.join(__dirname, "..", "frontend")));
app.use(express.json());

const dbPath = path.resolve(__dirname, "cards.db");
console.log("SQLite DB will be created at:", dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Database connection error:", err.message);
  } else {
    console.log("Connected to SQLite database.");
  }
});

db.serialize(() => {
  db.run(`
  CREATE TABLE IF NOT EXISTS cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    image TEXT NOT NULL,
    level INTEGER NOT NULL
  )
`);
  /*db.all(
    "SELECT sql FROM sqlite_master WHERE type='table' AND name='cards'",
    (err, row) => {
      console.log(row);
    },
  );*/
  // Step 1: Check if 'level' column exists
  db.all("PRAGMA table_info(cards)", (err, columns) => {
    if (err) {
      console.error("Error checking schema:", err.message);
      return;
    }

    const columnExists = columns.some((col) => col.name === "level");

    if (!columnExists) {
      db.run(
        `
      ALTER TABLE cards
      ADD COLUMN level INTEGER DEFAULT 1
    `,
        (err) => {
          if (err) {
            console.error("Error adding level column:", err.message);
          } else {
            console.log("Level column added successfully.");
            assignLevels(); // assign levels after adding column
          }
        },
      );
    } else {
      console.log("Level column already exists.");
      assignLevels(); // still ensure proper level assignment
    }
  });

  const defaultCards = [
    { name: "Rocket", image: "images/rocket.jpg", level: 1 },
    { name: "Moon", image: "images/moon.jpg", level: 1 },
    { name: "Star", image: "images/star.jpg", level: 1 },
    { name: "Comet", image: "images/comet.jpg", level: 1 },
    { name: "Sun", image: "images/sun.jpg", level: 1 },
    { name: "Planets", image: "images/planets.jpg", level: 1 },

    { name: "Asteroid", image: "images/asteroid.jpg", level: 2 },
    { name: "Blackhole", image: "images/blackhole.jpg", level: 2 },
    { name: "Galaxy", image: "images/galaxy.jpg", level: 2 },
    { name: "Nebula", image: "images/nebula.jpg", level: 2 },
    { name: "Earth", image: "images/earth.jpg", level: 2 },
    { name: "Mars", image: "images/mars.jpg", level: 2 },
    { name: "Jupiter", image: "images/jupiter.jpg", level: 2 },
    { name: "Saturn", image: "images/saturn.jpg", level: 2 },

    { name: "Satellite", image: "images/satellite.jpg", level: 3 },
    { name: "UFO", image: "images/ufo.jpg", level: 3 },
    { name: "Alien", image: "images/alien.jpg", level: 3 },
    { name: "Astronaut", image: "images/astronaut.jpg", level: 3 },
    { name: "Telescope", image: "images/telescope.jpg", level: 3 },
    { name: "Meteor", image: "images/meteor.jpg", level: 3 },
    { name: "Spaceship", image: "images/spaceship.jpg", level: 3 },
    { name: "Pluto", image: "images/pluto.jpg", level: 3 },
    { name: "Supernova", image: "images/supernova.jpg", level: 3 },
    { name: "MilkyWay", image: "images/milkyway.jpg", level: 3 },
  ];
  function assignLevels() {
    db.all("SELECT id, level FROM cards ORDER BY id", (err, rows) => {
      if (err) return console.error(err.message);

      let levelCounts = { 1: 6, 2: 8, 3: 10 };
      let idx = 0;

      for (let level = 1; level <= 3; level++) {
        const count = levelCounts[level];
        for (let i = 0; i < count && idx < rows.length; i++, idx++) {
          db.run(`UPDATE cards SET level = ? WHERE id = ?`, [
            level,
            rows[idx].id,
          ]);
        }
      }
    });
  }

  db.get("SELECT COUNT(*) as count FROM cards", (err, row) => {
    if (err) {
      console.error(err);
      return;
    }

    defaultCards.forEach((card) => {
      db.run(
        `INSERT OR IGNORE INTO cards (name, image, level) VALUES (?, ?, ?)`,
        [card.name, card.image, card.level],
        (err) => {
          if (err) console.error("Seed insert error:", err.message);
        },
      );
    });
  });
});

app.get("/api/cards", (req, res) => {
  const level = parseInt(req.query.level);
  const limit = parseInt(req.query.limit);

  db.all(
    "SELECT * FROM cards WHERE level = ? LIMIT ?",
    [level, limit],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    },
  );
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
