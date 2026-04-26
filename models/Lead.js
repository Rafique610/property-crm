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
}, { timestamps: true });

LeadSchema.pre("save", function () {
if (this.budget > 20000000) {
this.score = "High";
} else if (this.budget >= 10000000) {
this.score = "Medium";
} else {
this.score = "Low";
}
});

export default mongoose.models.Lead || mongoose.model("Lead", LeadSchema);
