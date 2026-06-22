import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import emotionRoutes from "./routes/emotion";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/health", (req, res) => {
  res.json({ status: "Mira is alive 🌊" });
});

app.use("/emotion", emotionRoutes);

app.listen(PORT, () => {
  console.log(`Mira backend running on port ${PORT}`);
});
