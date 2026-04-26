import mongoose from "mongoose";

const LeadSchema = new mongoose.Schema({
name: String,
email: String,
propertyInterest: String,
budget: Number,
status: {
type: String,
default: "New",
},
notes: String,
assignedTo: {
type: mongoose.Schema.Types.ObjectId,
ref: "User",
},
score: String,
followUpDate: Date,
lastActivity: {
type: Date,
default: Date.now,
}
}, { timestamps: true });


export default mongoose.models.Lead || mongoose.model("Lead", LeadSchema);
