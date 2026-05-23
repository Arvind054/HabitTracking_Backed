// Handles all the routes related to Habit(s) and HabitLogs
const express = require('express');
const router = express.Router();
const{createHabit, getHabit,getHabitById, updateHabit, deleteHabit} = require("../Controllers/habitControllers");
const {updateHabitStatus,getHabitHistory} = require("../Controllers/habitLogControllers");
// For habit Logs
router.post("/habits/:id/track", updateHabitStatus);
router.get("/habits/:id/history", getHabitHistory);

// For habit
router.post("/habits",createHabit);
router.get("/habits", getHabit);

router.get("/habits/:id", getHabitById);
router.put("/habits/:id", updateHabit);
router.delete("/habits/:id", deleteHabit);

module.exports = router;
