const Groq = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const generateSummary = async (salesData) => {
  const prompt = `
You are a professional business analyst. Analyze the following sales data and generate a concise executive summary.

Sales Data:
${salesData}

Your summary must include:
1. **Overall Performance**: Total revenue, total units sold
2. **Top Performing Category**: Which product category performed best
3. **Regional Breakdown**: Performance across regions
4. **Key Trends**: Any notable patterns or concerns
5. **Recommendations**: 2-3 actionable suggestions for the sales team

Format the response professionally, as if presenting to a C-suite executive.
Keep it under 400 words.
`;

  const response = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 800,
    temperature: 0.5,
  });

  return response.choices[0].message.content;
};

module.exports = { generateSummary };