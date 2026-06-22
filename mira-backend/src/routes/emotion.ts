import { Router, Request, Response } from "express";
import { analyzeFace } from "../services/rekognitionService";

const router = Router();

router.post("/analyze", async (req: Request, res: Response) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res
        .status(400)
        .json({ success: false, error: "No image provided" });
    }

    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const imageBytes = Buffer.from(base64Data, "base64");

    const result = await analyzeFace(imageBytes);

    res.json(result);
  } catch (error) {
    console.error("Route error:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

export default router;
