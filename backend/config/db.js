import mysql from "mysql2";

export const db = mysql.createConnection({
  host: mysql.railway.internal,
  user: root,
  password: ALaRqjEMITWtVuKQCGnHZSEVleLQEjwK,
  database: railway,
  port: 3306
});

db.connect((err) => {
  if (err) {
    console.error("DB Connection Failed ❌:", err);
  } else {
    console.log("MySQL Connected ✅");
  }
});
