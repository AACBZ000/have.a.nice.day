const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const { calculateBazi, getElementSummary } = require('../utils/baziCalculator');

/**
 * POST /api/bazi/calculate
 * Calculates the Four Pillars from birth date/time info.
 *
 * Body: { name, birthYear, birthMonth, birthDay, birthHourSlot, gender }
 *   birthHourSlot: 0-11 (0 = 子时 Rat 23:00-01:00, 1 = 丑时 Ox 01:00-03:00, …)
 */
router.post('/calculate', (req, res) => {
  try {
    const { name, birthYear, birthMonth, birthDay, birthHourSlot, gender } = req.body;

    // Input validation
    if (!name || !birthYear || !birthMonth || !birthDay) {
      return res.status(400).json({ error: 'Missing required fields: name, birthYear, birthMonth, birthDay' });
    }

    const year = parseInt(birthYear, 10);
    const month = parseInt(birthMonth, 10);
    const day = parseInt(birthDay, 10);
    const hourSlot = parseInt(birthHourSlot ?? 0, 10);

    if (isNaN(year) || year < 1900 || year > 2100) {
      return res.status(400).json({ error: 'Invalid birth year. Please use a year between 1900 and 2100.' });
    }
    if (isNaN(month) || month < 1 || month > 12) {
      return res.status(400).json({ error: 'Invalid birth month (1-12).' });
    }
    if (isNaN(day) || day < 1 || day > 31) {
      return res.status(400).json({ error: 'Invalid birth day (1-31).' });
    }
    if (isNaN(hourSlot) || hourSlot < 0 || hourSlot > 11) {
      return res.status(400).json({ error: 'Invalid hour slot (0-11).' });
    }

    const pillars = calculateBazi({ birthYear: year, birthMonth: month, birthDay: day, birthHourSlot: hourSlot });
    const elementSummary = getElementSummary(pillars);

    res.json({
      success: true,
      name,
      gender: gender || 'Unknown',
      birthDate: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      pillars,
      elementSummary,
    });
  } catch (err) {
    console.error('[/calculate] Error:', err);
    res.status(500).json({ error: 'Internal server error during BaZi calculation.' });
  }
});

/**
 * POST /api/bazi/interpret
 * Calls DeepSeek API with SSE streaming to generate an AI-powered reading.
 *
 * Body: { name, gender, pillars }
 *   pillars: { year, month, day, hour } — each with { stem, branch } objects
 */
router.post('/interpret', async (req, res) => {
  try {
    const { name, gender, pillars } = req.body;

    if (!name || !pillars) {
      return res.status(400).json({ error: 'Missing required fields: name, pillars' });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY || 'sk-7b904305eb6c413eb04a3bfb0ae5805d';

    const { year, month, day, hour } = pillars;

    const prompt = `You are a master of BaZi (Four Pillars of Destiny), the ancient Chinese art of destiny reading.
Analyze the following birth chart for ${name} (${gender || 'Unknown gender'}):

Year Pillar:  ${year.stem.english} / ${year.stem.chinese} (${year.stem.element}, ${year.stem.polarity}) — ${year.branch.chinese} ${year.branch.english} (${year.branch.element})
Month Pillar: ${month.stem.english} / ${month.stem.chinese} (${month.stem.element}, ${month.stem.polarity}) — ${month.branch.chinese} ${month.branch.english} (${month.branch.element})
Day Pillar:   ${day.stem.english} / ${day.stem.chinese} (${day.stem.element}, ${day.stem.polarity}) — ${day.branch.chinese} ${day.branch.english} (${day.branch.element})
Hour Pillar:  ${hour.stem.english} / ${hour.stem.chinese} (${hour.stem.element}, ${hour.stem.polarity}) — ${hour.branch.chinese} ${hour.branch.english} (${hour.branch.element})

Provide a comprehensive reading in English covering:

## Overall Destiny & Life Theme
Their core life purpose and energy — what this chart says about their overall destiny.

## Personality & Character
Key personality traits, strengths, and tendencies revealed by the chart.

## Career & Wealth
Best career paths, industries, and financial destiny.

## Love & Relationships
Romantic compatibility, relationship patterns, and what they need in a partner.

## Health & Vitality
Health tendencies, areas to watch, and how to maintain balance.

## Lucky Elements & Colors
Their favorable elements, colors, directions, and numbers.

Write in an engaging, insightful, and personal tone. Be specific to their chart. Write 3-4 sentences per section. Address ${name} directly where appropriate.`;

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    // Call DeepSeek API with streaming
    const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        stream: true,
        max_tokens: 1200,
        temperature: 0.8,
      }),
    });

    if (!deepseekResponse.ok) {
      const errorText = await deepseekResponse.text();
      console.error('[/interpret] DeepSeek API error:', deepseekResponse.status, errorText);
      res.write(`data: ${JSON.stringify({ error: `AI service error: ${deepseekResponse.status}` })}\n\n`);
      res.end();
      return;
    }

    // Stream the response back to the client as SSE
    const body = deepseekResponse.body;
    let buffer = '';

    body.on('data', (chunk) => {
      buffer += chunk.toString('utf8');
      const lines = buffer.split('\n');
      buffer = lines.pop(); // Keep incomplete line in buffer

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') {
          if (trimmed === 'data: [DONE]') {
            res.write('data: [DONE]\n\n');
          }
          continue;
        }
        if (trimmed.startsWith('data: ')) {
          try {
            const jsonStr = trimmed.slice(6);
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              res.write(`data: ${JSON.stringify({ content: delta })}\n\n`);
            }
          } catch (parseErr) {
            // Ignore parse errors for malformed chunks
          }
        }
      }
    });

    body.on('end', () => {
      res.write('data: [DONE]\n\n');
      res.end();
    });

    body.on('error', (streamErr) => {
      console.error('[/interpret] Stream error:', streamErr);
      res.write(`data: ${JSON.stringify({ error: 'Stream error from AI service.' })}\n\n`);
      res.end();
    });

    // Handle client disconnect
    req.on('close', () => {
      body.destroy();
    });

  } catch (err) {
    console.error('[/interpret] Error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error during AI interpretation.' });
    } else {
      res.write(`data: ${JSON.stringify({ error: 'Internal server error.' })}\n\n`);
      res.end();
    }
  }
});

module.exports = router;
