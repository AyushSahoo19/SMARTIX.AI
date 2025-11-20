
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateProjectPlan = async (goal: string) => {
  const model = "gemini-3-pro-preview";
  
  const prompt = `
    You are an expert project manager and technical researcher. 
    Create a comprehensive project plan for: "${goal}".
    
    1. Create actionable Tasks.
    2. Generate a RICH list of Resources. 
       - IMPORTANT: Provide real, high-quality, valid URLs for resources where applicable.
       - Include a mix of:
         - 'GENIUS': Top experts or thought leaders in the field.
         - 'BLOG': Best articles or documentation.
         - 'VIDEO': Best YouTube tutorials or talks.
         - 'GITHUB': Relevant open source repositories.
         - 'TOOL': Essential software or SaaS.
         - 'BOOK': Recommended reading.
    3. Structure a Mind Map.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          projectName: { type: Type.STRING },
          description: { type: Type.STRING },
          tasks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                priority: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
                estimatedHours: { type: Type.NUMBER },
              },
              required: ["title", "description", "priority", "estimatedHours"]
            }
          },
          resources: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                type: { type: Type.STRING, enum: ["PERSON", "GENIUS", "BLOG", "VIDEO", "PROJECT", "GITHUB", "BOOK", "LINK", "TOOL", "BUDGET", "MATERIAL"] },
                details: { type: Type.STRING },
                url: { type: Type.STRING, description: "A valid URL for this resource if applicable" }
              },
              required: ["name", "type", "details"]
            }
          },
          mindMapNodes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                label: { type: Type.STRING },
                type: { type: Type.STRING, enum: ["ROOT", "TASK", "RESOURCE", "NOTE"] },
                x: { type: Type.NUMBER },
                y: { type: Type.NUMBER },
                connectsTo: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                  description: "IDs of other nodes this node connects TO (source -> target)"
                }
              },
              required: ["id", "label", "type", "x", "y"]
            }
          }
        },
        required: ["projectName", "description", "tasks", "resources", "mindMapNodes"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
};
