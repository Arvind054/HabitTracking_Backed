// Habit Schema
const mongoose = require("mongoose");
const habitSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            default: "",
        },

        frequency: {
            type: String,
            enum: ["daily", "weekly"],
            required: true,
        },

        tags: {
            type: [String],
            default: [],
            set: (values) => [...new Set(values.map((value) => value.trim().toLowerCase()))],
        },

        currentStreak: {
            type: Number,
            default: 0,
        },

        bestStreak: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Habit", habitSchema);