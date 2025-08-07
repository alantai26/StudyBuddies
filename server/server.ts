import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authMiddleware } from './authMiddleware';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("No JWT_SECRET defined in .env file");
  process.exit(1);
}
const app = express();
const prisma = new PrismaClient();
const corsOptions = {
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
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


    res.sendStatus(201);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    res.json({ message: 'Login successful', token });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

app.get('/api/profile', authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, bio: true, socials: true }
    });
    if (!user) { return res.status(404).json({ message: 'User not found' }); }
    res.json(user);
  } catch (error) { res.status(500).json({ message: 'Failed to fetch profile' }); }
});


app.put('/api/profile', authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  const { name, bio, socials } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        bio,
        socials,
      },
      select: { id: true, name: true, email: true, bio: true, socials: true }
    });
    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

app.post('/api/sections', authMiddleware, async (req, res) => {
  const { crn, courseId } = req.body;
  if (!crn || !courseId) {
    return res.status(400).json({ message: 'CRN and Course ID are required.' });
  }
  try {
    const newSection = await prisma.section.create({
      data: { crn, courseId },
    });
    res.status(201).json(newSection);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({ message: 'A section with this CRN already exists.' });
    }
    res.status(500).json({ message: 'Failed to create new section.' });
  }
});
app.get('/api/courses', authMiddleware, async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        sections: true, 
      },
    });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch courses" });
  }
});

app.post('/api/sections/:id/enroll', authMiddleware, async (req, res) => {
  const sectionId = req.params.id;
  const userId = req.user.userId;
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        sections: { 
          connect: { id: sectionId }
        }
      }
    });
    res.status(200).json({ message: 'Successfully enrolled in section' });
  } catch (error) { res.status(500).json({ message: 'Failed to enroll in section' }); }
});


app.post('/api/sections/:id/unenroll', authMiddleware, async (req, res) => {
  const sectionId = req.params.id;
  const userId = req.user.userId;
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        sections: { 
          disconnect: { id: sectionId }
        }
      }
    });
    res.status(200).json({ message: 'Successfully unenrolled from section' });
  } catch (error) { res.status(500).json({ message: 'Failed to unenroll from section' }); }
});

app.post('/api/courses/upsert-batch', authMiddleware, async (req, res) => {
  const coursesFromScan: { name: string, crn: string, id: string }[] = req.body;
  if (!Array.isArray(coursesFromScan)) { return res.status(400).json({ message: 'Request body must be an array of courses.' }); }
  
  try {
    const sectionCrns: string[] = [];

    // This loop processes each scanned course
    for (const scannedCourse of coursesFromScan) {
      // 1. Find or create the parent Course (e.g., "CS3500")
      const course = await prisma.course.upsert({
        where: { courseCode: scannedCourse.id },
        update: {},
        create: {
          courseCode: scannedCourse.id,
          name: scannedCourse.name,
        },
      });

      // 2. Find or create the Section and connect it to the parent Course
      await prisma.section.upsert({
        where: { crn: scannedCourse.crn },
        update: {},
        create: {
          crn: scannedCourse.crn,
          courseId: course.id,
        },
      });
      sectionCrns.push(scannedCourse.crn);
    }
    
    // 3. Return the full Section objects to the frontend
    const updatedSections = await prisma.section.findMany({
      where: { crn: { in: sectionCrns } },
      include: { course: true }
    });

    res.status(200).json(updatedSections);
  } catch (error) {
    console.error("Batch upsert failed:", error);
    res.status(500).json({ message: 'Failed to update course database.' });
  }
});

app.get('/api/sections/:id/classmates', authMiddleware, async (req, res) => {
  const sectionId = req.params.id;
  const currentUserId = req.user.userId;
  try {
    const section = await prisma.section.findUnique({
      where: { id: sectionId },
      include: {
        students: {
          where: { id: { not: currentUserId } },
          select: { id: true, name: true, email: true, bio: true, socials: true }
        },
      },
    });
    if (!section) { return res.status(404).json({ message: 'Section not found' }); }
    res.json(section.students);
  } catch (error) { res.status(500).json({ message: 'Failed to fetch classmates' }); }
});

app.get('/api/profile/sections', authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        sections: { 
          include: {
            course: true, 
          },
        },
      },
    });
    if (!user) { return res.status(404).json({ message: 'User not found' }); }
    res.json(user.sections);
  } catch (error) { res.status(500).json({ message: 'Failed to fetch user sections' }); }
});



const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});