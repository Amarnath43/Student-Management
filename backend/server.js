const express = require('express');
const cors = require('cors');
require('dotenv').config();
const studentsRoutes = require('./src/routes/students.routes');
const marksRoutes = require('./src//routes/marks.routes');

const connectDB = require('./src/db/mongo');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());



app.use('/api/students', studentsRoutes);
app.use('/api/marks', marksRoutes);

// simple route
app.get('/', (req, res) => {
  res.send('Hello World!');
});


const start = async () => {
  try {
    await connectDB(); // wait for DB connection
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message || err);
    process.exit(1);
  }
};

// Add this at the end of backend/server.js, before app.listen()

app.use((err, req, res, next) => {
  console.error("🔥 Error caught:", err.message);

  res.status(500).json({ 
    error: err.message || 'Internal Server Error' 
  });
});

start();



module.exports = app;