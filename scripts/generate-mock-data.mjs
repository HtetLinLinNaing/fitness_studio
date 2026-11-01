import { mkdir, writeFile } from "node:fs/promises";

// Fixed inputs make regenerated fixtures stable across machines and dates.
const names = ["Jamie Tan", "Alex Lim", "Sarah Wong", "Daniel Lee", "Priya Nair",
  "Ryan Koh", "Mei Chen", "Amir Rahman", "Chloe Ng", "Marcus Goh", "Aisha Ali",
  "Ben Chua", "Grace Teo", "Ethan Low", "Sofia Chan", "Adam Yeo", "Isabel Ho",
  "Nathan Sim", "Olivia Tay", "Lucas Ong"];
const classDefinitions = [
  ["Yoga Flow", "Emma Wilson", 480, 60, 15, 12],
  ["Reformer Pilates", "Sarah Chen", 555, 60, 10, 10],
  ["HIIT Express", "James Miller", 630, 45, 16, 8],
  ["Barre Foundations", "Emma Wilson", 690, 60, 12, 0],
  ["Strength Circuit", "Marcus Taylor", 780, 60, 18, 14],
  ["Stretch & Restore", "Sarah Chen", 855, 45, 14, 6],
  ["Spin Energy", "James Miller", 915, 45, 15, 15],
  ["Mobility Basics", "Marcus Taylor", 975, 45, 12, 0],
  ["Mat Pilates", "Sarah Chen", 1_035, 60, 14, 9],
  ["Boxing Fundamentals", "James Miller", 1_110, 45, 16, 11],
  ["Power Yoga", "Emma Wilson", 1_170, 60, 12, 7],
  ["Evening Reset", "Marcus Taylor", 1_245, 45, 12, 5],
];

function timestamp(minutes, day = "02") {
  const hours = String(Math.floor(minutes / 60)).padStart(2, "0");
  const mins = String(minutes % 60).padStart(2, "0");
  return `2026-11-${day}T${hours}:${mins}:00+08:00`;
}

const classes = classDefinitions.map(([name, instructorName, start, duration, capacity, bookedCount], index) => {
  const id = `class-${String(index + 1).padStart(3, "0")}`;
  const active = Array.from({ length: bookedCount }, (_, attendee) => ({
    id: `${id}-booking-${String(attendee + 1).padStart(2, "0")}`,
    customerName: names[(index * 3 + attendee) % names.length],
    paymentType: ["membership", "package", "one-time"][attendee % 3],
    bookingStatus: attendee % 3 === 0 ? "checked-in" : "booked",
  }));
  const inactive = bookedCount === 0 ? [] : ["cancelled", "no-show"].map((bookingStatus, extra) => ({
    id: `${id}-booking-${String(bookedCount + extra + 1).padStart(2, "0")}`,
    customerName: names[(index * 3 + bookedCount + extra) % names.length],
    paymentType: ["one-time", "package"][extra],
    bookingStatus,
  }));
  return {
    id, name, instructorName,
    startsAt: timestamp(start), endsAt: timestamp(start + duration),
    bookedCount, capacity,
    status: index === 3 ? "cancelled" : bookedCount === capacity ? "full" : "scheduled",
    attendees: [...active, ...inactive],
  };
});

const products = [
  ["Yoga Mat", "Equipment", 2_800], ["Resistance Band", "Equipment", 1_200],
  ["Foam Roller", "Recovery", 3_500], ["Water Bottle", "Accessories", 1_800],
  ["Training Towel", "Accessories", 1_000], ["Pilates Ring", "Equipment", 3_200],
  ["Massage Ball", "Recovery", 1_500], ["Grip Socks", "Apparel", 1_800],
  ["Training Tee", "Apparel", 3_800], ["Yoga Block", "Equipment", 1_200],
  ["Stretch Strap", "Equipment", 1_500], ["Gym Bag", "Accessories", 4_800],
  ["Ankle Weights", "Equipment", 3_800], ["Recovery Wrap", "Recovery", 2_800],
  ["Protein Shaker", "Accessories", 1_800], ["Exercise Slider", "Equipment", 1_200],
  ["Cooling Towel", "Accessories", 1_500], ["Training Shorts", "Apparel", 3_800],
  ["Balance Pad", "Equipment", 3_500], ["Mini Band Set", "Equipment", 2_800],
];
const variants = ["Classic", "Studio", "Essential", "Pro", "Travel"];
const inventory = Array.from({ length: 100 }, (_, index) => {
  const [name, category, price] = products[index % products.length];
  return {
    id: `item-${String(index + 1).padStart(3, "0")}`,
    name: `${name} — ${variants[Math.floor(index / products.length)]}`,
    sku: `HLFS-${String(index + 1).padStart(4, "0")}`,
    category,
    stock: index % 11 === 0 ? 0 : (index * 7 + 12) % 61,
    unitPriceCents: price,
  };
});

const stockMovements = inventory.flatMap((item, index) => {
  if (index % 7 === 0 && index !== 0) return [];
  // A positive opening quantity and sale/adjustment leave the displayed stock.
  const quantities = [item.stock + 5, -3, -2];
  return quantities.map((quantityChange, movement) => ({
    id: `${item.id}-movement-${movement + 1}`,
    itemId: item.id,
    occurredAt: timestamp(540 + movement * 60, "01"),
    quantityChange,
    reason: ["Opening stock", "Studio shop sale", "Class supply allocation"][movement],
  }));
});

const output = new URL("../src/mocks/data/", import.meta.url);
await mkdir(output, { recursive: true });
await Promise.all([
  ["classes.json", classes], ["inventory.json", inventory],
  ["stock-movements.json", stockMovements],
].map(([filename, data]) => writeFile(new URL(filename, output), `${JSON.stringify(data, null, 2)}\n`)));
console.log(`Generated ${classes.length} classes, ${inventory.length} inventory items, and ${stockMovements.length} stock movements.`);
