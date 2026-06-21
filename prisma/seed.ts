import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  // Clear existing data
  await prisma.userBadge.deleteMany();
  await prisma.userChallenge.deleteMany();
  await prisma.habitLog.deleteMany();
  await prisma.carbonEntry.deleteMany();
  await prisma.aISuggestion.deleteMany();
  await prisma.weeklyReport.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash("Password123!", 10);

  // Users
  const user1 = await prisma.user.create({
    data: {
      name: "Demo User",
      email: "demo@example.com",
      password: hashedPassword,
      city: "San Francisco",
      country: "USA",
      totalPoints: 450,
    },
  });

  console.log("Created user:", user1.email);

  // Badges
  const badgesData = [
    { name: "Green Starter", description: "Completed your first carbon footprint calculation", icon: "🌱", criteria: "Complete first carbon calculation", pointsRequired: 0 },
    { name: "Eco Explorer", description: "Completed 5 eco challenges", icon: "🌍", criteria: "Complete 5 challenges", pointsRequired: 200 },
    { name: "Carbon Crusher", description: "Reduced monthly footprint by 10%", icon: "💪", criteria: "10% monthly reduction", pointsRequired: 300 },
    { name: "Habit Hero", description: "Maintained a 7-day habit streak", icon: "🔥", criteria: "7-day habit streak", pointsRequired: 150 },
    { name: "Eco Warrior", description: "Reduced monthly footprint by 25%", icon: "⚔️", criteria: "25% monthly reduction", pointsRequired: 500 },
    { name: "Planet Protector", description: "Earned 1000+ total points", icon: "🛡️", criteria: "1000 total points", pointsRequired: 1000 },
    { name: "Streak Master", description: "Maintained a 30-day habit streak", icon: "⭐", criteria: "30-day habit streak", pointsRequired: 800 },
    { name: "Zero Hero", description: "Achieved net-zero for one month", icon: "🏆", criteria: "Net-zero monthly footprint", pointsRequired: 2000 }
  ];
  await prisma.badge.createMany({ data: badgesData });
  const badges = await prisma.badge.findMany();

  // Give user some badges
  await prisma.userBadge.createMany({
    data: [
      { userId: user1.id, badgeId: badges[0].id },
      { userId: user1.id, badgeId: badges[1].id },
    ]
  });

  // Challenges
  const challengesData = [
    { title: "No Car Day", description: "Go an entire day without using a personal car. Use public transport, bike, or walk instead.", category: "TRANSPORT" as const, pointsReward: 50, durationDays: 1, badgeIcon: "🚫🚗", difficulty: "EASY" as const },
    { title: "Meatless Monday", description: "Eat only vegetarian or vegan meals for an entire Monday. Discover delicious plant-based alternatives!", category: "FOOD" as const, pointsReward: 30, durationDays: 1, badgeIcon: "🥬", difficulty: "EASY" as const },
    { title: "Energy Saver Week", description: "Reduce your electricity consumption by 20% for a full week. Turn off unused lights, unplug devices.", category: "ELECTRICITY" as const, pointsReward: 100, durationDays: 7, badgeIcon: "⚡", difficulty: "MEDIUM" as const },
    { title: "Zero Waste Day", description: "Produce zero landfill waste for one day. Recycle, compost, and use reusable items.", category: "WASTE" as const, pointsReward: 40, durationDays: 1, badgeIcon: "♻️", difficulty: "MEDIUM" as const },
    { title: "Plant a Tree", description: "Plant a tree or contribute to a tree-planting initiative. One tree absorbs ~22kg CO2/year.", category: "WASTE" as const, pointsReward: 200, durationDays: 1, badgeIcon: "🌳", difficulty: "EASY" as const }
  ];
  await prisma.challenge.createMany({ data: challengesData });
  const challenges = await prisma.challenge.findMany();

  await prisma.userChallenge.createMany({
    data: [
      { userId: user1.id, challengeId: challenges[0].id, startDate: new Date(Date.now() - 2 * 24*60*60*1000), endDate: new Date(Date.now() - 1 * 24*60*60*1000), status: "COMPLETED", progress: 100, completedAt: new Date() },
      { userId: user1.id, challengeId: challenges[1].id, startDate: new Date(), endDate: new Date(Date.now() + 1 * 24*60*60*1000), status: "ACTIVE", progress: 0 }
    ]
  });

  // Carbon Entries (Sample data for 3 months)
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();
  
  const entries = [
    { userId: user1.id, category: "TRANSPORT" as const, subcategory: "car_petrol", value: 300, unit: "km", co2Kg: 63, month: currentMonth, year: currentYear },
    { userId: user1.id, category: "ELECTRICITY" as const, subcategory: "grid_average", value: 200, unit: "kWh", co2Kg: 105.4, month: currentMonth, year: currentYear },
    { userId: user1.id, category: "FOOD" as const, subcategory: "non_veg", value: 45, unit: "meals", co2Kg: 148.5, month: currentMonth, year: currentYear },
    // Previous month (slightly higher)
    { userId: user1.id, category: "TRANSPORT" as const, subcategory: "car_petrol", value: 400, unit: "km", co2Kg: 84, month: currentMonth - 1 || 12, year: currentMonth - 1 === 0 ? currentYear - 1 : currentYear },
    { userId: user1.id, category: "ELECTRICITY" as const, subcategory: "grid_average", value: 250, unit: "kWh", co2Kg: 131.75, month: currentMonth - 1 || 12, year: currentMonth - 1 === 0 ? currentYear - 1 : currentYear },
    { userId: user1.id, category: "FOOD" as const, subcategory: "non_veg", value: 60, unit: "meals", co2Kg: 198, month: currentMonth - 1 || 12, year: currentMonth - 1 === 0 ? currentYear - 1 : currentYear },
  ];
  await prisma.carbonEntry.createMany({ data: entries });

  // Habit Logs
  const habitLogs = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    habitLogs.push({ userId: user1.id, habitType: "AVOID_PLASTIC" as const, completed: true, date: d, impactKg: 0.3 });
    if (i % 2 === 0) habitLogs.push({ userId: user1.id, habitType: "PUBLIC_TRANSPORT" as const, completed: true, date: d, impactKg: 2.4 });
  }
  await prisma.habitLog.createMany({ data: habitLogs });

  console.log("Seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
