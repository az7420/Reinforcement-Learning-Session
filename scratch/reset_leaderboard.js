const binId = '69f7830f856a682189a0643c';
const apiKey = '$2a$10$EmDGOZZTH9Fg.h8BOU3zZ.tWNJk2govWxAaDZIQwJHzXVFMMhkAS2';

async function reset() {
  console.log('Attempting to reset leaderboard...');
  try {
    const res = await fetch('https://api.jsonbin.io/v3/b/' + binId, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': apiKey
      },
      body: JSON.stringify({ entries: [] })
    });
    const data = await res.json();
    console.log('Reset complete:', data);
  } catch (e) {
    console.error('Error:', e);
  }
}

reset();
