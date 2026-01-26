export const GREEN_COVER_TEMPLATE = (
    location: string,
    lat?: number,
    lng?: number
) => `
You are an urban ecology analyst.

Estimate green cover using known urban patterns, climate, population density, and regional vegetation trends.
You MUST provide realistic numeric estimates. Do NOT return null.

Location: ${location}
${lat && lng ? `Coordinates: ${lat}, ${lng}` : ""}

Tasks:

1. Estimate current urban tree canopy coverage (0–100%).
2. Rate Tree Index (0–10) based on that coverage.
3. Estimate current number of urban trees.
4. Calculate trees required to reach 40% canopy.
5. Identify 3–5 real streets, parks, or zones needing reforestation.
6. Provide approximate GPS coordinates.

Use logical assumptions if exact data is unavailable.

Output ONLY valid JSON in this format:

{
  "location": "${location}",
  "coords": { "lat": number, "lng": number },
  "summary": "Brief assessment",
  "treeIndex": number,
  "treeCanopy": {
    "coveragePercentage": number,
    "targetCoverage": 40,
    "estimatedTreeCount": number,
    "treesToPlant": number,
    "localSpecies": ["species"]
  },
  "reforestationZones": [
    {
      "name": "Zone Name",
      "lat": number,
      "lng": number,
      "priority": "High|Medium|Low",
      "reason": "Reason"
    }
  ],
  "insight": "Actionable insight"
}

Important:
- Never use null.
- Never repeat 40 as coverage.
- All numbers must be realistic.
`;
