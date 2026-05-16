const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors());
app.use(express.json());

app.post('/strava/token', async (req, res) => {
  const { client_id, client_secret, refresh_token } = req.body;
  if (!client_id || !client_secret || !refresh_token) {
    return res.status(400).json({ error: 'Parametri mancanti' });
  }
  try {
    const r = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id, client_secret, refresh_token, grant_type: 'refresh_token' })
    });
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'Errore Strava token', detail: e.message });
  }
});

app.post('/strava/activities', async (req, res) => {
  const { access_token, per_page = 60 } = req.body;
  if (!access_token) return res.status(400).json({ error: 'access_token mancante' });
  try {
    const r = await fetch(`https://www.strava.com/api/v3/athlete/activities?per_page=${per_page}`, {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'Errore Strava activities', detail: e.message });
  }
});

app.get('/', (req, res) => res.json({ status: 'ok', service: 'trail-coach-server' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server attivo su porta ${PORT}`));
