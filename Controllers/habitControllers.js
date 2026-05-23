const mongoose = require('mongoose');
const Habit = require('../Models/habitSchema');

const allowedFrequencies = new Set(['daily', 'weekly']);

function normalizeTags(tags) {
   if (!Array.isArray(tags)) {
      return [];
   }

   return [...new Set(tags.map((tag) => String(tag).trim().toLowerCase()).filter(Boolean))];
}

function buildHabitPayload(body) {
   const payload = {};

   if (body.title !== undefined) {
      payload.title = body.title.trim();
   }

   if (body.description !== undefined) {
      payload.description = body.description;
   }

   if (body.frequency !== undefined) {
      payload.frequency = body.frequency;
   }

   if (body.tags !== undefined) {
      payload.tags = normalizeTags(Array.isArray(body.tags) ? body.tags : String(body.tags).split(','));
   }

   return payload;
}

function isValidString(value) {
   return typeof value === 'string' && value.trim().length > 0;
}

function parsePositiveInteger(value, fallback) {
   if (value === undefined) {
      return fallback;
   }

   const parsed = Number.parseInt(value, 10);

   if (!Number.isFinite(parsed) || parsed < 1) {
      return null;
   }

   return parsed;
}

function applyStreakMeta(habit) {
   if (!habit) {
      return habit;
   }

   return {
      ...habit.toObject(),
      currentStreak: habit.currentStreak || 0,
      bestStreak: habit.bestStreak || 0,
   };
}

// Create a new habit
module.exports.createHabit = async (req, res) => {
   try {
      const { title, description = '', frequency, tags = [] } = req.body;

      if (!isValidString(title) || !isValidString(frequency)) {
         return res.status(400).json({
            message: 'title and frequency are required',
         });
      }

      if (!allowedFrequencies.has(frequency.trim())) {
         return res.status(400).json({
            message: 'frequency must be either daily or weekly',
         });
      }

      const habit = await Habit.create({
         user: req.user.userId,
         title: title.trim(),
         description,
         frequency: frequency.trim(),
         tags: normalizeTags(Array.isArray(tags) ? tags : String(tags).split(',')),
      });

      return res.status(201).json({
         message: 'Habit created successfully',
         habit,
      });
   } catch (error) {
      return res.status(500).json({
         message: 'Failed to create habit',
         error: error.message,
      });
   }
};

// Get all habits for the logged-in user
module.exports.getHabit = async (req, res) => {
   try {
      const { page = 1, limit = 10, tag } = req.query;
      const parsedPage = parsePositiveInteger(page, 1);
      const parsedLimit = parsePositiveInteger(limit, 10);

      if (parsedPage === null || parsedLimit === null) {
         return res.status(400).json({
            message: 'page and limit must be positive integers',
         });
      }

      const query = { user: req.user.userId };

      if (tag) {
         query.tags = { $in: [String(tag).trim().toLowerCase()] };
      }

      const [habits, totalItems] = await Promise.all([
         Habit.find(query)
            .sort({ createdAt: -1 })
            .skip((parsedPage - 1) * parsedLimit)
            .limit(parsedLimit),
         Habit.countDocuments(query),
      ]);

      return res.status(200).json({
         message: 'Habits fetched successfully',
         habits: habits.map(applyStreakMeta),
         pagination: {
            page: parsedPage,
            limit: parsedLimit,
            totalItems,
            totalPages: Math.max(Math.ceil(totalItems / parsedLimit), 1),
         },
      });
   } catch (error) {
      return res.status(500).json({
         message: 'Failed to fetch habits',
         error: error.message,
      });
   }
};

// Get habit by ID
module.exports.getHabitById = async (req, res) => {
   try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
         return res.status(400).json({ message: 'Invalid habit id' });
      }

      const habit = await Habit.findOne({ _id: id, user: req.user.userId });

      if (!habit) {
         return res.status(404).json({ message: 'Habit not found' });
      }

      return res.status(200).json({
         message: 'Habit fetched successfully',
         habit: applyStreakMeta(habit),
      });
   } catch (error) {
      return res.status(500).json({
         message: 'Failed to fetch habit',
         error: error.message,
      });
   }
};

// Update habit
module.exports.updateHabit = async (req, res) => {
   try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
         return res.status(400).json({ message: 'Invalid habit id' });
      }

      const updates = buildHabitPayload(req.body);

      if (Object.keys(updates).length === 0) {
         return res.status(400).json({ message: 'At least one field is required to update' });
      }

      if (updates.frequency && !allowedFrequencies.has(updates.frequency.trim())) {
         return res.status(400).json({
            message: 'frequency must be either daily or weekly',
         });
      }

      if (updates.frequency) {
         updates.frequency = updates.frequency.trim();
      }

      const habit = await Habit.findOneAndUpdate(
         { _id: id, user: req.user.userId },
         updates,
         { new: true, runValidators: true }
      );

      if (!habit) {
         return res.status(404).json({ message: 'Habit not found' });
      }

      return res.status(200).json({
         message: 'Habit updated successfully',
         habit,
      });
   } catch (error) {
      return res.status(500).json({
         message: 'Failed to update habit',
         error: error.message,
      });
   }
};

// Delete habit
module.exports.deleteHabit = async (req, res) => {
   try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
         return res.status(400).json({ message: 'Invalid habit id' });
      }

      const habit = await Habit.findOneAndDelete({ _id: id, user: req.user.userId });

      if (!habit) {
         return res.status(404).json({ message: 'Habit not found' });
      }

      return res.status(200).json({
         message: 'Habit deleted successfully',
      });
   } catch (error) {
      return res.status(500).json({
         message: 'Failed to delete habit',
         error: error.message,
      });
   }
};


