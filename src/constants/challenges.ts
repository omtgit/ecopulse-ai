import type { HabitDefinition } from "@/types/habit.types";
import type { ChallengeData } from "@/types/habit.types";

/**
 * Predefined habit definitions for daily tracking.
 * Impact values are estimated daily CO2 savings in kg.
 */
export const HABIT_DEFINITIONS: HabitDefinition[] = [
  {
    type: "PUBLIC_TRANSPORT",
    label: "Used Public Transport",
    description: "Took bus, train, or metro instead of driving",
    icon: "🚌",
    impactKgPerDay: 2.4,
    category: "TRANSPORT",
  },
  {
    type: "BIKE_OR_WALK",
    label: "Biked or Walked",
    description: "Used cycling or walking for commute/errands",
    icon: "🚴",
    impactKgPerDay: 3.0,
    category: "TRANSPORT",
  },
  {
    type: "AVOID_PLASTIC",
    label: "Avoided Single-Use Plastic",
    description: "Used reusable bags, containers, or straws",
    icon: "♻️",
    impactKgPerDay: 0.3,
    category: "WASTE",
  },
  {
    type: "REDUCE_ELECTRICITY",
    label: "Reduced Electricity Usage",
    description: "Turned off lights, unplugged devices, used natural light",
    icon: "💡",
    impactKgPerDay: 1.2,
    category: "ELECTRICITY",
  },
  {
    type: "REUSABLE_BOTTLE",
    label: "Used Reusable Bottle",
    description: "Carried a reusable water bottle instead of buying plastic",
    icon: "🍶",
    impactKgPerDay: 0.2,
    category: "WASTE",
  },
  {
    type: "PLANT_BASED_MEAL",
    label: "Ate Plant-Based Meal",
    description: "Chose vegetarian or vegan meals for the day",
    icon: "🥗",
    impactKgPerDay: 2.5,
    category: "FOOD",
  },
  {
    type: "COMPOST_WASTE",
    label: "Composted Waste",
    description: "Composted food scraps and organic waste",
    icon: "🌱",
    impactKgPerDay: 0.5,
    category: "WASTE",
  },
  {
    type: "NO_FOOD_WASTE",
    label: "Zero Food Waste",
    description: "Finished all meals, no food thrown away",
    icon: "🍽️",
    impactKgPerDay: 0.8,
    category: "FOOD",
  },
];

/**
 * Predefined eco challenges with rewards.
 * These are seeded into the database.
 */
export const DEFAULT_CHALLENGES: Omit<ChallengeData, "id" | "isActive">[] = [
  {
    title: "No Car Day",
    description:
      "Go an entire day without using a personal car. Use public transport, bike, or walk instead.",
    category: "TRANSPORT",
    pointsReward: 50,
    durationDays: 1,
    badgeIcon: "🚫🚗",
    difficulty: "EASY",
  },
  {
    title: "Meatless Monday",
    description:
      "Eat only vegetarian or vegan meals for an entire Monday. Discover delicious plant-based alternatives!",
    category: "FOOD",
    pointsReward: 30,
    durationDays: 1,
    badgeIcon: "🥬",
    difficulty: "EASY",
  },
  {
    title: "Energy Saver Week",
    description:
      "Reduce your electricity consumption by 20% for a full week. Turn off unused lights, unplug devices.",
    category: "ELECTRICITY",
    pointsReward: 100,
    durationDays: 7,
    badgeIcon: "⚡",
    difficulty: "MEDIUM",
  },
  {
    title: "Zero Waste Day",
    description:
      "Produce zero landfill waste for one day. Recycle, compost, and use reusable items.",
    category: "WASTE",
    pointsReward: 40,
    durationDays: 1,
    badgeIcon: "♻️",
    difficulty: "MEDIUM",
  },
  {
    title: "Plant a Tree",
    description:
      "Plant a tree or contribute to a tree-planting initiative. One tree absorbs ~22kg CO2/year.",
    category: "WASTE",
    pointsReward: 200,
    durationDays: 1,
    badgeIcon: "🌳",
    difficulty: "EASY",
  },
  {
    title: "Bike Commute Week",
    description:
      "Use a bicycle for your daily commute for an entire week. Great for health and the planet!",
    category: "TRANSPORT",
    pointsReward: 150,
    durationDays: 7,
    badgeIcon: "🚴‍♂️",
    difficulty: "HARD",
  },
  {
    title: "Vegan Week",
    description:
      "Follow a fully vegan diet for 7 days. Discover the environmental impact of plant-based eating.",
    category: "FOOD",
    pointsReward: 120,
    durationDays: 7,
    badgeIcon: "🌿",
    difficulty: "HARD",
  },
  {
    title: "Digital Detox Day",
    description:
      "Minimize screen time for a day — reduces energy consumption from devices and data centers.",
    category: "ELECTRICITY",
    pointsReward: 35,
    durationDays: 1,
    badgeIcon: "📵",
    difficulty: "MEDIUM",
  },
  {
    title: "Local Shopping Only",
    description:
      "Buy only locally-produced goods for a week to reduce transportation emissions.",
    category: "SHOPPING",
    pointsReward: 80,
    durationDays: 7,
    badgeIcon: "🏪",
    difficulty: "MEDIUM",
  },
  {
    title: "Cold Shower Challenge",
    description:
      "Take cold showers for 3 days to save energy on water heating.",
    category: "ELECTRICITY",
    pointsReward: 60,
    durationDays: 3,
    badgeIcon: "🚿",
    difficulty: "HARD",
  },
];

/**
 * Badge definitions for gamification.
 */
export const DEFAULT_BADGES = [
  {
    name: "Green Starter",
    description: "Completed your first carbon footprint calculation",
    icon: "🌱",
    criteria: "Complete first carbon calculation",
    pointsRequired: 0,
  },
  {
    name: "Eco Explorer",
    description: "Completed 5 eco challenges",
    icon: "🌍",
    criteria: "Complete 5 challenges",
    pointsRequired: 200,
  },
  {
    name: "Carbon Crusher",
    description: "Reduced monthly footprint by 10%",
    icon: "💪",
    criteria: "10% monthly reduction",
    pointsRequired: 300,
  },
  {
    name: "Habit Hero",
    description: "Maintained a 7-day habit streak",
    icon: "🔥",
    criteria: "7-day habit streak",
    pointsRequired: 150,
  },
  {
    name: "Eco Warrior",
    description: "Reduced monthly footprint by 25%",
    icon: "⚔️",
    criteria: "25% monthly reduction",
    pointsRequired: 500,
  },
  {
    name: "Planet Protector",
    description: "Earned 1000+ total points",
    icon: "🛡️",
    criteria: "1000 total points",
    pointsRequired: 1000,
  },
  {
    name: "Streak Master",
    description: "Maintained a 30-day habit streak",
    icon: "⭐",
    criteria: "30-day habit streak",
    pointsRequired: 800,
  },
  {
    name: "Zero Hero",
    description: "Achieved net-zero for one month",
    icon: "🏆",
    criteria: "Net-zero monthly footprint",
    pointsRequired: 2000,
  },
];

/**
 * Carbon offset suggestions
 */
export const CARBON_OFFSET_SUGGESTIONS = [
  {
    title: "Plant Trees",
    description: "One tree absorbs approximately 22 kg of CO2 per year.",
    icon: "🌳",
    impactPerUnit: 22,
    unit: "tree/year",
    links: [
      { name: "One Tree Planted", url: "https://onetreeplanted.org" },
      { name: "Ecosia", url: "https://ecosia.org" },
    ],
  },
  {
    title: "Switch to Renewable Energy",
    description: "Switching to solar/wind can offset ~80% of electricity emissions.",
    icon: "☀️",
    impactPerUnit: 0.5,
    unit: "kWh saved",
    links: [
      { name: "EnergySage", url: "https://energysage.com" },
    ],
  },
  {
    title: "Support Carbon Removal",
    description: "Invest in direct air capture or biochar projects.",
    icon: "🏭",
    impactPerUnit: 1,
    unit: "kg CO2 removed",
    links: [
      { name: "Climeworks", url: "https://climeworks.com" },
    ],
  },
  {
    title: "Community Solar",
    description: "Join a community solar project if you can't install panels.",
    icon: "🔆",
    impactPerUnit: 200,
    unit: "kg CO2/year",
    links: [],
  },
];
