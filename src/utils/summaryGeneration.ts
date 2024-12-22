import { GoogleGenerativeAI } from "@google/generative-ai";
import { tracker } from "../commands/activityTracker";

async function generateSummary() {
    
  const codeHistory = tracker.getFormattedSummary();

  const genAI = new GoogleGenerativeAI(
    "AIzaSyAG7Ba5QwzEMBW1r2emkwe2aW_yAwPVOts"
  );

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt =
    "You are an assistant tasked with analyzing and summarizing code changes.The following is a detailed log of code changes, where each entry includes a file path, content, and timestamp. Summarize the key information from these changes, highlighting file-specific updates, timestamps of significant changes, and any patterns or recurring elements in the content. Here is the log:";

  try {
    const result = await model.generateContent(`${prompt}\n${codeHistory}`);

    if(!result.response.text()){
        return "No summary generated from AI";
    }
    console.log(result.response.text());
    return result.response.text();

  } catch (error) {
    console.log("Error generating AI summary: ", error);
    return;
  }
}
generateSummary();
