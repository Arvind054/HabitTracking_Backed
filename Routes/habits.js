// Handles all the routes related to Habit(s) and HabitLogs
const express = require('express');
const router = express.Router();
const{createHabit, getHabit,getHabitById, updateHabit, deleteHabit} = require("../Controllers/habitControllers");
const {updateHabitStatus,getHabitHistory} = require("../Controllers/habitLogControllers");
const authMiddleware = require("../Middleware/authMiddleware");

router.use(authMiddleware);
// For habit Logs
router.post("/:id/track", updateHabitStatus);
router.get("/:id/history", getHabitHistory);

// For habit
router.post("/",createHabit);
router.get("/", getHabit);

router.get("/:id", getHabitById);
router.put("/:id", updateHabit);
router.delete("/:id", deleteHabit);

module.exports = router;
