// Handles all the routes related to Habit(s) and HabitLogs
const express = require('express');
const router = express.Router();

// For habit Logs
router.post("/habits/:id/track", registeruser);
router.delete("/habits/:id/history", registeruser);

// For habit
router.post("/habits",createHabit);
router.get("/habits", getHabit);

router.get("/habits/:id", getHabitById);
router.put("/habits/:id", updateHabit);
router.delete("/habits/:id", deleteHabit);

module.exports = router;
