import { GoogleGenAI, Type } from "@google/genai";
import { AppData, Breakdown, MaintenanceRecord, Vehicle } from "../types";
import { BREAKDOWN_CATEGORIES, MAINTENANCE_TYPES } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export interface Suggestion {
  id: string;
  vehicleId: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  type: 'preventative' | 'info';
}

export async function getProactiveSuggestions(data: AppData, vehicleId: string): Promise<Suggestion[]> {
  const vehicle = data.vehicles.find(v => v.id === vehicleId);
  if (!vehicle) return [];

  const breakdowns = (data.breakdowns || []).filter(b => b.vehicleId === vehicleId);
  const records = data.records.filter(r => r.vehicleId === vehicleId);

  if (breakdowns.length === 0 && records.length === 0) {
    return [{
      id: crypto.randomUUID(),
      vehicleId,
      title: "ابدأ بتوثيق صيانة مركبتك",
      description: "إضافة سجلات الصيانة السابقة يساعد النظام في تقديم نصائح مخصصة لمركبتك.",
      priority: 'low',
      type: 'info'
    }];
  }

  const prompt = `
    Analyze the following vehicle data and provide proactive maintenance suggestions.
    Vehicle: ${vehicle.make} ${vehicle.model} (${vehicle.year}), Odometer: ${vehicle.currentOdometer} km.
    
    Breakdowns (Unplanned repairs):
    ${breakdowns.map(b => `- Date: ${b.date}, Category: ${BREAKDOWN_CATEGORIES[b.category].label}, Description: ${b.description}`).join('\n')}
    
    Maintenance Records (Planned):
    ${records.map(r => `- Date: ${r.date}, Type: ${MAINTENANCE_TYPES[r.type as keyof typeof MAINTENANCE_TYPES]?.label || r.type}, Title: ${r.title}`).join('\n')}
    
    Based on this data, suggest up to 3 preventative maintenance tasks or insights. 
    Focus on patterns. If a specific breakdown (e.g., cooling) is frequent, suggest a deep inspection or related preventative part replacement.
    
    Respond in JSON format as an array of objects:
    {
      "title": "Short title in Arabic",
      "description": "Detailed clear explanation in Arabic",
      "priority": "low" | "medium" | "high",
      "type": "preventative" | "info"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              priority: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
              type: { type: Type.STRING, enum: ['preventative', 'info'] }
            },
            required: ["title", "description", "priority", "type"]
          }
        }
      }
    });

    const suggestions: Omit<Suggestion, "id" | "vehicleId">[] = JSON.parse(response.text || "[]");
    return suggestions.map(s => ({
      ...s,
      id: crypto.randomUUID(),
      vehicleId
    }));
  } catch (error) {
    console.error("Error generating suggestions:", error);
    return [];
  }
}
