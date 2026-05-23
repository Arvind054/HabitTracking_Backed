const mongoose = require('mongoose');
const Habit = require('../Models/habitSchema');

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

   return payload;
}

// Create a new habit
module.exports.createHabit = async (req, res) => {
   try {
      const { title, description = '', frequency } = req.body;

      if (!title || !frequency) {
         return res.status(400).json({
            message: 'title and frequency are required',
         });
      }

      const habit = await Habit.create({
         user: req.user.userId,
         title: title.trim(),
         description,
         frequency,
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
      const habits = await Habit.find({ user: req.user.userId }).sort({ createdAt: -1 });

      return res.status(200).json({
         message: 'Habits fetched successfully',
         habits,
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
         habit,
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


