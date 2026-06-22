import fs from "fs";
import axios from "axios";

const imagePath = "/Users/anjukaranji/Desktop/imgs/anju/hair-appt.JPG";

async function testRekognition() {
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString("base64");
  const dataUrl = `data:image/jpeg;base64,${base64Image}`;

  try {
    const response = await axios.post("http://localhost:5001/emotion/analyze", {
      image: dataUrl,
    });
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error: any) {
    console.error("Error:", error.response?.data || error.message);
  }
}

testRekognition();
