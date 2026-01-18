export interface PollutantInsightData {
    pollutant: string
    value: number
    cityName: string
    aqi: number
    allPollutants: {
        [key: string]: number
    }
}

export function getPollutantInsightPrompt(data: PollutantInsightData): string {
    return `You are an environmental health expert analyzing air quality data for ${data.cityName}.

Current Air Quality Data:
- Pollutant: ${data.pollutant}
- Current Value: ${data.value}
- Overall AQI: ${data.aqi}
- All Pollutants: ${JSON.stringify(data.allPollutants, null, 2)}

Please provide a concise, informative analysis (max 150 words) covering:

1. **Why is ${data.pollutant} at this level?**
   - Explain the likely sources specific to ${data.cityName} (e.g., traffic, industry, weather, seasonal factors)
   - Consider local context and typical patterns

2. **Health Impact:**
   - Brief explanation of how this pollutant affects health at the current level
   - Who is most at risk?

3. **Actionable Advice:**
   - What should residents do right now?
   - Any specific precautions for ${data.cityName}?

Keep the tone friendly, informative, and actionable. Focus on practical insights rather than technical jargon.`
}
