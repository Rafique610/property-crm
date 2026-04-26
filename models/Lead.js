import mongoose from "mongoose";

const LeadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    propertyInterest: { type: String, required: true },
    budget: { type: Number, required: true },
    status: {
      type: String,
      enum: ["New", "Contacted", "In Progress", "Closed"],
      default: "New",
    },
    notes: String,
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    score: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Low",
    },
    followUpDate: Date,
    lastActivity: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// AUTO-SCORE based on budget
// Uses async pre-save (no next() parameter) — works in all Mongoose 6+ / 7+ versions
LeadSchema.pre("save", async function () {
  if (this.isModified("budget") || this.isNew) {
    if (this.budget > 20_000_000) {
      this.score = "High";
    } else if (this.budget >= 10_000_000) {
      this.score = "Medium";
    } else {
      this.score = "Low";
    }
  }
});

// Delete cached model to prevent stale hook on Next.js hot-reload
delete mongoose.models["Lead"];

export default mongoose.model("Lead", LeadSchema);