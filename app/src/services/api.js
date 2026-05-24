/**
 * Destiny Pillars - API Service
 * Handles all communication with the Node.js backend.
 *
 * To change the server address (e.g. when deploying to a real server),
 * update BACKEND_URL below.
 */

// ---------------------------------------------------------------------------
// Configuration — change this when you deploy to a real server
// ---------------------------------------------------------------------------
export const BACKEND_URL = 'https://have-a-nice-day-7w5t.onrender.com';

// ---------------------------------------------------------------------------
// Calculate BaZi pillars from birth data
// ---------------------------------------------------------------------------

/**
 * POST /api/bazi/calculate
 *
 * @param {Object} params
 * @param {string} params.name
 * @param {number} params.birthYear
 * @param {number} params.birthMonth  - 1-12
 * @param {number} params.birthDay    - 1-31
 * @param {number} params.birthHourSlot - 0-11 (Chinese double-hour slot index)
 * @param {string} params.gender      - 'Male' | 'Female'
 * @returns {Promise<Object>} BaZi chart data
 */
export async function calculateBazi({ name, birthYear, birthMonth, birthDay, birthHourSlot, gender }) {
  const response = await fetch(`${BACKEND_URL}/api/bazi/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, birthYear, birthMonth, birthDay, birthHourSlot, gender }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Server error: ${response.status}`);
  }

  return response.json();
}

// ---------------------------------------------------------------------------
// Stream AI interpretation via Server-Sent Events (SSE)
// ---------------------------------------------------------------------------

/**
 * POST /api/bazi/interpret  (SSE streaming)
 *
 * Streams the AI reading chunk by chunk.
 *
 * @param {Object}   params
 * @param {string}   params.name
 * @param {string}   params.gender
 * @param {Object}   params.pillars    - { year, month, day, hour }
 * @param {Function} onChunk           - Called with each text fragment (string)
 * @param {Function} onDone            - Called when streaming is complete
 * @param {Function} onError           - Called with an Error object on failure
 * @returns {AbortController}          - Call .abort() to cancel the stream
 */
export function streamInterpretation({ name, gender, pillars }, onChunk, onDone, onError) {
  const controller = new AbortController();

  (async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/bazi/interpret`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, gender, pillars }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || `Server error: ${response.status}`);
      }

      // Read the SSE stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // SSE lines are separated by '\n\n'
        const lines = buffer.split('\n');
        buffer = lines.pop(); // Keep incomplete line in buffer

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          if (trimmed === 'data: [DONE]') {
            onDone();
            return;
          }

          if (trimmed.startsWith('data: ')) {
            try {
              const payload = JSON.parse(trimmed.slice(6));
              if (payload.error) {
                onError(new Error(payload.error));
                return;
              }
              if (payload.content) {
                onChunk(payload.content);
              }
            } catch {
              // Skip malformed SSE lines
            }
          }
        }
      }

      // Stream ended without [DONE] — treat as complete
      onDone();
    } catch (err) {
      if (err.name === 'AbortError') return; // Intentionally cancelled
      onError(err);
    }
  })();

  return controller;
}
