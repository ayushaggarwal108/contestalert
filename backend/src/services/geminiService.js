const { GoogleGenAI } = require('@google/genai');
const Contest = require('../models/Contest');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Pre-filters contests based on keywords to keep the processing context efficient.
 */
const getRelevantContestsContext = async (message) => {
  const msgLower = message.toLowerCase();
  const filter = {
    status: { $in: ['upcoming', 'ongoing'] },
    endTime: { $gte: new Date() }
  };
  
  // Basic keyword filtering
  const platforms = [];
  if (msgLower.includes('leetcode')) platforms.push('LeetCode');
  if (msgLower.includes('codeforces')) platforms.push('Codeforces');
  if (msgLower.includes('codechef')) platforms.push('CodeChef');
  if (msgLower.includes('atcoder')) platforms.push('AtCoder');
  if (msgLower.includes('hackerrank')) platforms.push('HackerRank');

  if (platforms.length > 0) {
    filter.platform = { $in: platforms };
  }

  // Limit to next 10 relevant contests to avoid token overflow
  const contests = await Contest.find(filter)
    .sort({ startTime: 1 })
    .limit(10)
    .lean(); // Lean for simple JSON format
    
  return contests;
};

/**
 * Processes user messages using the Virtual Assistant, incorporating history.
 */
const processChat = async (userId, message, history = []) => {
  try {
    const contests = await getRelevantContestsContext(message);
    
    // Construct context string
    const contextStr = contests.map(c => 
      `ID: ${c._id}, Name: ${c.name}, Platform: ${c.platform}, Start: ${c.startTime}, URL: ${c.url}`
    ).join('\n');

    const historyStr = history.map(h => `${h.role === 'ai' ? 'Assistant' : 'User'}: ${h.text}`).join('\n');

    const prompt = `
      You are a specialized assistant for the ContestAlert System.
      Your job is to understand the user's request, provide a helpful natural language response, and extract scheduling intent if they want a reminder.
      
      Conversation History:
      ${historyStr || 'No previous history.'}
      
      Here are the upcoming contests related to their query:
      ${contextStr || 'No upcoming contests found for this query.'}
      
      User Message: "${message}"
      
      Respond STRICTLY with a valid JSON object matching this schema:
      {
        "responseMessage": "Your natural language reply to the user. Keep it friendly and concise.",
        "intent": "query" | "schedule",
        "scheduleParams": {
          "contestId": "The ID of the contest to schedule from the context, or null if intent is query",
          "platform": "The platform of the contest, or null",
          "contestName": "The name of the contest, or null"
        }
      }
    `;

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    
    const responseText = result.text;
    
    // The response is guaranteed to be JSON due to responseMimeType
    const parsedResponse = JSON.parse(responseText);
    
    return parsedResponse;
  } catch (error) {
    console.error('Processing Error:', error);
    throw new Error('Failed to process message.');
  }
};

module.exports = {
  processChat
};
