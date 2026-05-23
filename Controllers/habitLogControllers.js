const mongoose = require('mongoose');
const Habit = require('../Models/habitSchema');
const HabitLog = require('../Models/habitLogSchema');

function getDayKey(date) {
   return date.toISOString().slice(0, 10);
}

function isValidObjectId(value) {
   return mongoose.Types.ObjectId.isValid(value);
}

function getLast7Days() {
   const days = [];
   const today = new Date();

   for (let offset = 6; offset >= 0; offset -= 1) {
      const date = new Date(today);
      date.setUTCDate(today.getUTCDate() - offset);
      days.push(getDayKey(date));
   }

   return days;
}

function calculateStreaks(dates) {
   const sortedDates = [...new Set(dates)].sort();

   if (sortedDates.length === 0) {
      return { currentStreak: 0, bestStreak: 0 };
   }

   const dayMs = 24 * 60 * 60 * 1000;
   let bestStreak = 1;
   let currentRun = 1;

   for (let index = 1; index < sortedDates.length; index += 1) {
      const previous = new Date(`${sortedDates[index - 1]}T00:00:00.000Z`);
      const current = new Date(`${sortedDates[index]}T00:00:00.000Z`);
      const diffDays = (current - previous) / dayMs;

      if (diffDays === 1) {
         currentRun += 1;
      } else {
         bestStreak = Math.max(bestStreak, currentRun);
         currentRun = 1;
      }
   }

   bestStreak = Math.max(bestStreak, currentRun);

   let currentStreak = 1;
   for (let index = sortedDates.length - 1; index > 0; index -= 1) {
      const previous = new Date(`${sortedDates[index - 1]}T00:00:00.000Z`);
      const current = new Date(`${sortedDates[index]}T00:00:00.000Z`);
      const diffDays = (current - previous) / dayMs;

      if (diffDays === 1) {
         currentStreak += 1;
      } else {
         break;
      }
   }

   return { currentStreak, bestStreak };
}

async function refreshHabitStreaks(habitId) {
   const logs = await HabitLog.find({ habit: habitId }).sort({ date: 1 }).lean();
   const dates = logs.map((log) => log.date);
   const { currentStreak, bestStreak } = calculateStreaks(dates);

   await Habit.findByIdAndUpdate(habitId, { currentStreak, bestStreak });

   return { currentStreak, bestStreak };
}

// update the status of the Habit : mark as Done
module.exports.updateHabitStatus = async (req, res) => {
   try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
         return res.status(400).json({ message: 'Invalid habit id' });
      }

      const habit = await Habit.findOne({ _id: id, user: req.user.userId });

      if (!habit) {
         return res.status(404).json({ message: 'Habit not found' });
      }

      const trackedDate = getDayKey(new Date());
      const existingLog = await HabitLog.findOne({ habit: habit._id, user: req.user.userId, date: trackedDate });

      if (existingLog) {
         return res.status(409).json({ message: 'Habit already marked completed for today' });
      }

      const log = await HabitLog.create({
         habit: habit._id,
         user: req.user.userId,
         date: trackedDate,
      });

      const streaks = await refreshHabitStreaks(habit._id);

      return res.status(201).json({
         message: 'Habit marked as completed for today',
         log,
         streaks,
      });
   } catch (error) {
      if (error.code === 11000) {
         return res.status(409).json({ message: 'Habit already marked completed for today' });
      }

      return res.status(500).json({
         message: 'Failed to update habit status',
         error: error.message,
      });
   }
};

// Get the past 7 days History of the habit
module.exports.getHabitHistory = async (req, res) => {
   try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
         return res.status(400).json({ message: 'Invalid habit id' });
      }

      const habit = await Habit.findOne({ _id: id, user: req.user.userId });

      if (!habit) {
         return res.status(404).json({ message: 'Habit not found' });
      }

      const dates = getLast7Days();
      const logs = await HabitLog.find({
         habit: habit._id,
         date: { $in: dates },
      }).sort({ date: 1 });

      const logMap = new Map(logs.map((log) => [log.date, true]));

      const history = dates.map((date) => ({
         date,
         completed: logMap.has(date),
      }));

      return res.status(200).json({
         message: 'Habit history fetched successfully',
         habitId: habit._id,
         history,
      });
   } catch (error) {
      return res.status(500).json({
         message: 'Failed to fetch habit history',
         error: error.message,
      });
   }
};


