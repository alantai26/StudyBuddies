// server/server.ts
import 'dotenv/config'; // Loads variables from .env into process.env
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("No JWT_SECRET defined in .env file");
  process.exit(1);
}
const app = express();
const prisma = new PrismaClient();
app.use(cors());
app.use(express.json());

app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10); 

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    res.status(201).json({ message: 'User created successfully', userId: user.id });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});