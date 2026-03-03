import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import apiRoutes from './routes/api.js';

dotenv.config({ path: '.env.local' });
dotenv.config(); // fallback

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Main API Router
app.use('/api', apiRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
