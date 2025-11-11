import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import courseRoutes from './routes/courseRoutes.js';
import progressRoutes from './routes/progressRoutes.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// ✅ Route chính
app.use('/api/courses', courseRoutes);
app.use('/api/progress', progressRoutes);

app.get('/', (req, res) => {
  res.send('✅ Learning Service is running...');
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`🚀 Learning service running on port ${PORT}`));
