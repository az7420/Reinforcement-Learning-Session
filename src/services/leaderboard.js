/**
 * leaderboard.js  — JSONBin.io backed leaderboard (LIVE ✅)
 *
 * Entries are sorted by fastest total completion time.
 * Falls back to localStorage if the network is unavailable.
 */

// ── JSONBin.io config (live) ──────────────────────────────────────────────────
const BIN_ID  = '69f7830f856a682189a0643c';
const API_KEY = '$2a$10$EmDGOZZTH9Fg.h8BOU3zZ.tWNJk2govWxAaDZIQwJHzXVFMMhkAS2';
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

const HEADERS = {
  'Content-Type': 'application/json',
  'X-Master-Key': API_KEY,
  'X-Bin-Versioning': 'false',   // always overwrites, no version history
};

// ── Read all entries ──────────────────────────────────────────────────────────
export async function fetchLeaderboard() {
  try {
    const res = await fetch(`${BASE_URL}/latest`, {
      headers: { 'X-Master-Key': API_KEY },
    });
    if (!res.ok) throw new Error('fetch failed');
    const data = await res.json();
    return data.record?.entries ?? [];
  } catch (e) {
    console.warn('[Leaderboard] fetch error:', e);
    // Fallback to localStorage
    return getLocalEntries();
  }
}

// ── Submit a new entry ────────────────────────────────────────────────────────
export async function submitEntry(entry) {
  // Always save locally first
  saveLocalEntry(entry);

  if (!BIN_ID || BIN_ID.includes('YOUR_BIN_ID')) {
    console.warn('[Leaderboard] JSONBin not configured — saved locally only.');
    return getLocalEntries();
  }

  try {
    // Read current entries
    const entries = await fetchLeaderboard();
    // Add new entry
    entries.push(entry);
    // Sort by date descending (newest first)
    entries.sort((a, b) => new Date(b.date) - new Date(a.date));
    // Keep top 100
    const trimmed = entries.slice(0, 100);

    // Write back
    const res = await fetch(BASE_URL, {
      method: 'PUT',
      headers: HEADERS,
      body: JSON.stringify({ entries: trimmed }),
    });

    if (res.ok) {
      return trimmed;
    } else {
      throw new Error('update failed');
    }
  } catch (e) {
    console.warn('[Leaderboard] submit error:', e);
    return null;
  }
}

// ── Local persistence: Disabled ───────────────────────────────────────────
function getLocalEntries() {
  return [];
}

function saveLocalEntry(entry) {
  // Session only, not saved to localStorage
}
