const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");
const Message = require("./Models/Message");
const Symptom = require("./Models/Symptom");

const app = express();
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "build")));

// Handle other routes and serve 'index.html'
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// Enable CORS
app.use(cors());

mongoose
  .connect("mongodb://localhost:27017/Medi-ChatBot", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });

// NLP Setup
const natural = require("natural");
const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;

const fetchSymptomsDatabase = async () => {
  try {
    const symptoms = await Symptom.find({});
    const symptomsDatabase = {};
    symptoms.forEach((symptom) => {
      symptomsDatabase[symptom.name.toLowerCase()] = {
        treatments: symptom.treatments,
        dietRecommendations: symptom.dietRecommendations,
      };
    });
    return symptomsDatabase;
  } catch (error) {
    console.error("Error fetching symptoms from database:", error);
    return {};
  }
};

const processMessage = async (message) => {
  const normalizedMessage = message.toLowerCase().trim();
  if (normalizedMessage === "hi" || normalizedMessage === "hello") {
    return "Hi there! How can I assist you today?";
  }

  const tokens = tokenizer.tokenize(normalizedMessage);
  const stemmedTokens = tokens.map((token) => stemmer.stem(token));

  const symptomsDatabase = await fetchSymptomsDatabase();

  // Match tokens with symptoms in the database
  let detectedSymptoms = [];
  for (let symptom in symptomsDatabase) {
    if (stemmedTokens.includes(stemmer.stem(symptom))) {
      detectedSymptoms.push(symptom);
    }
  }

  if (detectedSymptoms.length === 0) {
    return "I'm sorry, I couldn't identify your symptoms. Please provide more details.";
  }

  // Fetch treatments and diet recommendations
  let treatments = [];
  let diets = [];
  detectedSymptoms.forEach((symptom) => {
    treatments = [...treatments, ...symptomsDatabase[symptom].treatments];
    diets = [...diets, ...symptomsDatabase[symptom].dietRecommendations];
  });

  // Remove duplicates
  treatments = [...new Set(treatments)];
  diets = [...new Set(diets)];

  // Generate a response
  let response = "Based on your symptoms, I suggest the following treatments:";
  treatments.forEach((treatment) => {
    response += `${treatment},\n`;
  });

  response += "Additionally, consider the following diet recommendations:";
  diets.forEach((diet) => {
    response += `${diet},`;
  });

  return response;
};

app.post("/api/chat", async (req, res) => {
  const { message, user } = req.body;
  try {
    const response = await processMessage(message);

    // Save the message to the database
    const newMessage = new Message({ user, text: message });
    await newMessage.save();

    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: "Failed to process message" });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 5000");
});
