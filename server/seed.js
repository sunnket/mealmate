const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding MealMate database...');

  // Clear existing data
  await prisma.noShow.deleteMany();
  await prisma.wasteLog.deleteMany();
  await prisma.mealRating.deleteMany();
  await prisma.leftoverQueue.deleteMany();
  await prisma.entry.deleteMany();
  await prisma.vote.deleteMany();
  await prisma.meal.deleteMany();
  await prisma.student.deleteMany();

  // Create 5 students
  const password = await bcrypt.hash('test1234', 10);
  const students = await Promise.all(
    [
      { name: 'Aryan Sharma', rollNumber: '21CS101', email: 'aryan@hostel.edu', room: '204', block: 'A' },
      { name: 'Priya Patel', rollNumber: '21CS102', email: 'priya@hostel.edu', room: '305', block: 'B' },
      { name: 'Rahul Singh', rollNumber: '21CS103', email: 'rahul@hostel.edu', room: '112', block: 'A' },
      { name: 'Sneha Gupta', rollNumber: '21CS104', email: 'sneha@hostel.edu', room: '408', block: 'C' },
      { name: 'Vikram Reddy', rollNumber: '21CS105', email: 'vikram@hostel.edu', room: '201', block: 'B' },
    ].map((s) =>
      prisma.student.create({
        data: { ...s, password, qrCodeHash: uuidv4() },
      })
    )
  );
  console.log(`✅ Created ${students.length} students`);

  // Create today's 3 meals
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth();
  const d = today.getDate();

  const mealsData = [
    {
      mealType: 'breakfast',
      menuItems: JSON.stringify(['Poha', 'Upma', 'Bread & Butter', 'Boiled Eggs', 'Milk', 'Tea/Coffee']),
      voteDeadline: new Date(y, m, d, 7, 0),
      mainStartTime: new Date(y, m, d, 7, 30),
      mainEndTime: new Date(y, m, d, 9, 0),
      leftoverEndTime: new Date(y, m, d, 9, 30),
    },
    {
      mealType: 'lunch',
      menuItems: JSON.stringify(['Rice', 'Dal Tadka', 'Aloo Gobi', 'Roti', 'Raita', 'Salad', 'Pickle']),
      voteDeadline: new Date(y, m, d, 11, 30),
      mainStartTime: new Date(y, m, d, 12, 0),
      mainEndTime: new Date(y, m, d, 13, 30),
      leftoverEndTime: new Date(y, m, d, 14, 0),
    },
    {
      mealType: 'dinner',
      menuItems: JSON.stringify(['Jeera Rice', 'Paneer Butter Masala', 'Roti', 'Mixed Veg', 'Curd', 'Gulab Jamun']),
      voteDeadline: new Date(y, m, d, 18, 30),
      mainStartTime: new Date(y, m, d, 19, 0),
      mainEndTime: new Date(y, m, d, 20, 30),
      leftoverEndTime: new Date(y, m, d, 21, 0),
    },
  ];

  const meals = await Promise.all(
    mealsData.map((meal) =>
      prisma.meal.create({
        data: { ...meal, date: new Date(y, m, d), status: 'upcoming' },
      })
    )
  );
  console.log(`✅ Created ${meals.length} meals for today`);

  // Create sample votes (60% eat, 40% skip)
  const voteChoices = ['eat', 'eat', 'eat', 'skip', 'skip'];
  for (const meal of meals) {
    for (let i = 0; i < students.length; i++) {
      await prisma.vote.create({
        data: {
          studentId: students[i].id,
          mealId: meal.id,
          vote: voteChoices[i],
        },
      });
    }
  }
  console.log(`✅ Created sample votes`);

  // Create 7 days of waste log history
  for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
    const pastDate = new Date(y, m, d - dayOffset);

    for (const mealType of ['breakfast', 'lunch', 'dinner']) {
      const histMeal = await prisma.meal.create({
        data: {
          date: pastDate,
          mealType,
          menuItems: JSON.stringify(['Sample Item 1', 'Sample Item 2']),
          voteDeadline: pastDate,
          mainStartTime: pastDate,
          mainEndTime: pastDate,
          leftoverEndTime: pastDate,
          status: 'closed',
        },
      });

      if (dayOffset > 0) {
        const estimated = 80 + Math.floor(Math.random() * 40);
        const actual = estimated - Math.floor(Math.random() * 20);
        const leftover = Math.floor(Math.random() * 10);
        const donated = Math.floor(leftover * 0.6);
        const wasted = parseFloat((Math.random() * 3).toFixed(1));

        await prisma.wasteLog.create({
          data: {
            mealId: histMeal.id,
            estimatedServings: estimated,
            actualServed: actual,
            leftoverServings: leftover,
            donatedServings: donated,
            wastedKg: wasted,
          },
        });
      }
    }
  }
  console.log(`✅ Created 7 days of waste log history`);

  console.log('\n🎉 Seeding complete!');
  console.log('\n📋 Login credentials:');
  console.log('  Student: 21CS101 / test1234');
  console.log('  Admin:   admin / admin1234');
  console.log('  Gate:    gate / gate1234');

  students.forEach((s) => {
    console.log(`  ${s.name}: QR Hash = ${s.qrCodeHash}`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
