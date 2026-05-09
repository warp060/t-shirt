const pool = require('./db');
async function fix() {
  await pool.execute('UPDATE orders SET status = "delivered", updated_at = NOW() WHERE id = 1050044');
  console.log("Updated ORD-1050044 to delivered");
  process.exit(0);
}
fix();
