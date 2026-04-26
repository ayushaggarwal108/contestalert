const axios = require('axios');
const Contest = require('../models/Contest');

const fetchAndStoreContests = async () => {
  let upsertCount = 0;
  
  // 1. Codeforces API
  try {
    console.log('Fetching from Codeforces API...');
    const cfRes = await axios.get('https://codeforces.com/api/contest.list?gym=false');
    if (cfRes.data.status === 'OK') {
      for (const item of cfRes.data.result) {
        if (item.phase === 'FINISHED' || item.phase === 'PENDING_SYSTEM_TEST') continue;
        const startTime = new Date(item.startTimeSeconds * 1000);
        await Contest.updateOne(
          { platform: 'Codeforces', url: `https://codeforces.com/contests/${item.id}` },
          { $set: { name: item.name, startTime, endTime: new Date((item.startTimeSeconds + item.durationSeconds) * 1000), duration: item.durationSeconds, status: item.phase === 'CODING' ? 'ongoing' : 'upcoming' } },
          { upsert: true }
        );
        upsertCount++;
      }
    }
  } catch (err) { console.error('Codeforces error:', err.message); }

  // 2. LeetCode GraphQL
  try {
    console.log('Fetching from LeetCode GraphQL...');
    const lcRes = await axios.post('https://leetcode.com/graphql', {
      query: '{ topTwoContests { title titleSlug startTime duration } }'
    }, { headers: { 'Content-Type': 'application/json' }});
    
    if (lcRes.data?.data?.topTwoContests) {
      for (const item of lcRes.data.data.topTwoContests) {
        const startTime = new Date(item.startTime * 1000);
        if (new Date() - startTime > 86400000) continue; // Skip if very old
        await Contest.updateOne(
          { platform: 'LeetCode', url: `https://leetcode.com/contest/${item.titleSlug}` },
          { $set: { name: item.title, startTime, endTime: new Date((item.startTime + item.duration) * 1000), duration: item.duration, status: startTime > new Date() ? 'upcoming' : 'ongoing' } },
          { upsert: true }
        );
        upsertCount++;
      }
    }
  } catch (err) { console.error('LeetCode error:', err.message); }

  // 3. CodeChef API
  try {
    console.log('Fetching from CodeChef API...');
    const ccRes = await axios.get('https://www.codechef.com/api/list/contests/all');
    if (ccRes.data?.future_contests) {
      const ccContests = [...ccRes.data.present_contests, ...ccRes.data.future_contests];
      for (const item of ccContests) {
        // CodeChef provides dates in ISO format strings
        const startTime = new Date(item.contest_start_date_iso);
        const endTime = new Date(item.contest_end_date_iso);
        const durationSecs = (endTime - startTime) / 1000;
        await Contest.updateOne(
          { platform: 'CodeChef', url: `https://www.codechef.com/${item.contest_code}` },
          { $set: { name: item.contest_name, startTime, endTime, duration: durationSecs, status: startTime > new Date() ? 'upcoming' : 'ongoing' } },
          { upsert: true }
        );
        upsertCount++;
      }
    }
  } catch (err) { console.error('CodeChef error:', err.message); }

  console.log(`Successfully UPSERTED ${upsertCount} total contests across platforms.`);
};

module.exports = { fetchAndStoreContests };
