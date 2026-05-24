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

    const prompt = `你是一位精通八字命理的大师，擅长四柱八字的推算与解读。
请为${name}（${gender === 'Male' ? '男' : gender === 'Female' ? '女' : gender || '未知'}）分析以下八字命盘：

年柱：${year.stem.english}（${year.stem.element}）- ${year.branch.english}（${year.branch.element}）
月柱：${month.stem.english}（${month.stem.element}）- ${month.branch.english}（${month.branch.element}）
日柱：${day.stem.english}（${day.stem.element}）- ${day.branch.english}（${day.branch.element}）
时柱：${hour.stem.english}（${hour.stem.element}）- ${hour.branch.english}（${hour.branch.element}）

请用中文进行详细解读，涵盖以下六个方面：

## 命局总论
## 性格特质
## 事业财运
## 感情婚姻
## 健康养生
## 用神喜忌

语言生动，富有洞察力，每个方面写3-4句话，直接称呼${name}。`;

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
