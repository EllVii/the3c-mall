import { initDatabase, getSummary } from "../db.js";

console.log("🗄️  Initializing database...");
initDatabase();

console.log("📊 Database initialized successfully!");
console.log("\nCurrent summary:");
const summary = getSummary();
console.log(JSON.stringify(summary, null, 2));
