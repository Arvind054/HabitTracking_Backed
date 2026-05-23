// habitLog Schema

const mongoose = require("mongoose");
const habitLogSchema = new mongoose.Schema(
    {
        habit: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Habit",
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        completedAt: {
            type: Date,
            default: Date.now,
        },

        date: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("HabitLog", habitLogSchema);