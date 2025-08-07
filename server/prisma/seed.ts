import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const coursesData = [
  {
    courseCode: 'CS3500',
    name: 'Object-Oriented Design',
    sections: []
  },
  {
    courseCode: 'CS3000',
    name: 'Algorithms',
    sections: []
  },
  {
    courseCode: 'MATH1341',
    name: 'Calculus 1',
    sections: []
  },
  {
    courseCode: 'MATH1342',
    name: 'Calculus 2',
    sections: []
  }
];

async function main() {
  console.log('Start seeding ...');

  for (const course of coursesData) {
    const createdCourse = await prisma.course.upsert({
      where: { courseCode: course.courseCode },
      update: {},
      create: {
        courseCode: course.courseCode,
        name: course.name,
      },
    });
    console.log(`Upserted course: ${createdCourse.name}`);

    // for (const section of course.sections) {
    //   await prisma.section.upsert({
    //     where: { crn: section.crn },
    //     update: {},
    //     create: {
    //       crn: section.crn,
    //       courseId: createdCourse.id,
    //     },
    //   });
    //   console.log(`  - Upserted section with CRN: ${section.crn}`);
    // }
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
