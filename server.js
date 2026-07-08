const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'apis-local' });
});

// Demo endpoints for Playwright-like tests
app.get('/users', (req, res) => {
  res.json([
    { id: 1, name: 'Ada Lovelace', email: 'ada@example.com' },
    { id: 2, name: 'Grace Hopper', email: 'grace@example.com' },
  ]);
});

app.get('/users/:id', (req, res) => {
  const id = Number(req.params.id);
  if (id === 1) {
    return res.json({ id, name: 'Ada Lovelace', email: 'ada@example.com' });
  }
  return res.status(404).json({ error: 'User not found' });
});

app.post('/users', (req, res) => {
  res.status(201).json({ id: 3, ...req.body });
});

app.put('/users/:id', (req, res) => {
  res.json({ id: Number(req.params.id), ...req.body });
});

app.patch('/users/:id', (req, res) => {
  res.json({ id: Number(req.params.id), ...req.body });
});

app.delete('/users/:id', (req, res) => {
  res.status(200).json({ deleted: true, id: Number(req.params.id) });
});

app.get('/posts', (req, res) => {
  res.json([
    { id: 1, userId: 1, title: 'Hello', body: 'World' },
  ]);
});

app.get('/posts/:id', (req, res) => {
  res.json({ id: Number(req.params.id), userId: 1, title: 'Hello', body: 'World' });
});

app.post('/posts', (req, res) => {
  res.status(201).json({ id: 11, ...req.body });
});

// BankFacilito-like endpoints
app.post('/api/v1/register', (req, res) => {
  const { first_name, last_name, email, pin } = req.body || {};

  if (!first_name || !last_name || !email || !pin) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  return res.status(201).json({
    message: 'User registered successfully',
    user: { first_name, last_name, email, pin },
  });
});

app.post('/api/v1/login', (req, res) => {
  const { account_number, pin } = req.body || {};
  if (!account_number || !pin) {
    return res.status(400).json({ error: 'Missing account_number or pin' });
  }

  return res.status(200).json({
    message: 'Login successful',
    token: 'demo-token',
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API listening on http://0.0.0.0:${PORT}`);
});
