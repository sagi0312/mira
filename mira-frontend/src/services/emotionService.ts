import axios from "axios";
import type { RekognitionResponse } from "../types";

const API_BASE_URL = "http://localhost:5001";

export async function analyzeEmotion(
  base64Image: string,
): Promise<RekognitionResponse> {
  try {
    const response = await axios.post<RekognitionResponse>(
      `${API_BASE_URL}/emotion/analyze`,
      { image: base64Image },
    );
    return response.data;
  } catch (error) {
    console.error("Error calling emotion service:", error);
    return { success: false, error: "Failed to reach Mira backend" };
  }
}
