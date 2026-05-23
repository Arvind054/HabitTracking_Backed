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
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Habit", habitSchema);