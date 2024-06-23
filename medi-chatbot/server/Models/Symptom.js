const mongoose = require("mongoose");

const symptomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  treatments: { type: [String], default: [] },
  dietRecommendations: { type: [String], default: [] },
});

const Symptom = mongoose.model("Symptom", symptomSchema);

module.exports = Symptom;
