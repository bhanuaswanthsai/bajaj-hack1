/**
 * SRM Full Stack Engineering Challenge - Backend Server
 * 
 * Express.js server with POST /bfhl endpoint
 * Processes hierarchical relationships (tree/graph data)
 */

const express = require('express');
const cors = require('cors');
const { processHierarchy } = require('./utils/hierarchyProcessor');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────
app.use(cors());                         // Enable CORS for frontend
app.use(express.json());                 // Parse JSON request bodies

// ─── POST /bfhl ──────────────────────────────────────────────
app.post('/bfhl', (req, res) => {
  try {
    const { data } = req.body;

    // Validate that 'data' is an array
    if (!data || !Array.isArray(data)) {
      return res.status(400).json({
        is_success: false,
        error: 'Invalid request. "data" must be an array of strings.'
      });
    }

    // Process the hierarchy data
    const result = processHierarchy(data);

    return res.status(200).json({
      is_success: true,
      ...result
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({
      is_success: false,
      error: 'Internal server error'
    });
  }
});

// ─── Health Check ────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'BFHL API is running', version: '1.0.0' });
});

// ─── Start Server ────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 BFHL Backend running on http://localhost:${PORT}`);
});
