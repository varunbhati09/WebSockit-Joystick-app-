const express = require('express');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(cors());

const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (ws) => {
    console.log('Client connected');
  
    ws.on('message', (message) => {
      console.log(`Received message: ${message}`);
    
    });
  
    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });

let data = [
  { id: 1, name: 'Data 1' },
  { id: 2, name: 'Data 2' },
  { id: 3, name: 'Data 3' },
];

let users = [
  { id: 1, username: 'user1', password: 'password1' },
  { id: 2, username: 'user2', password: 'password2' },
];


app.post('/api/authenticate', (req, res) => {
  const { username, password } = req.body;

 
  const user = users.find((u) => u.username === username && u.password === password);

  if (!user) {
    
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  res.json({ message: 'Authentication successful' });
});

app.get('/api/somedata', (req, res) => {
  res.json(data);
});

app.post('/api/createdata', (req, res) => {
  const newData = req.body;
  newData.id = data.length + 1; 
  data.push(newData); 
  res.json({ message: 'Data created successfully', data: newData });
});


app.put('/api/updatedata/:id', (req, res) => {
  const { id } = req.params;
  const newData = req.body;
  const dataIndex = data.findIndex((d) => d.id === Number(id));

  if (dataIndex === -1) {
    return res.status(404).json({ error: 'Data not found' });
  }

  data[dataIndex] = { ...data[dataIndex], ...newData };
  res.json({ message: `Data with ID ${id} updated successfully`, data: data[dataIndex] });
});


app.delete('/api/deletedata/:id', (req, res) => {
  const { id } = req.params;
  const dataIndex = data.findIndex((d) => d.id === Number(id));

  if (dataIndex === -1) {
    return res.status(404).json({ error: 'Data not found' });
  }

  data.splice(dataIndex, 1);
  res.json({ message: `Data with ID ${id} deleted successfully` });
});

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});
