const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { Pool } = require('@neondatabase/serverless');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function updateUserData() {
    try {
        console.log('🔗 Connecting to database...');

        // 1. Get a user
        const users = await pool.query("SELECT id, full_name, role FROM users WHERE role != 'aspirant' LIMIT 5");

        if (users.rows.length === 0) {
            console.log("No non-aspirant users found.");
            return;
        }

        console.log("Found users:", users.rows.map(u => `${u.id}: ${u.full_name}`).join(', '));

        const targetUser = users.rows[0];
        console.log(`\n📝 Updating user: ${targetUser.full_name} (ID: ${targetUser.id})`);

        // 2. Update their Pincode and Salary
        const updateQuery = `
        UPDATE users 
        SET pincode = '110001', current_salary = '25000', city = 'New Delhi' 
        WHERE id = $1
    `;

        await pool.query(updateQuery, [targetUser.id]);

        console.log(`✅ User ${targetUser.full_name} updated successfully!`);
        console.log("   - Pincode: 110001");
        console.log("   - Salary: 25000");
        console.log("   - City: New Delhi");

    } catch (err) {
        console.error('❌ Update failed:', err);
    } finally {
        await pool.end();
    }
}

updateUserData();
