const sqlite3 = require("sqlite3");

async function getUserByLineId(lineId) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database("./restaurant.db");
    db.get("SELECT * FROM tb_user WHERE lineid = ?", [lineId], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

async function viewAllSchedule() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database("./restaurant.db");
    const query = `
           SELECT 
                id || ' | ' || 
                name_doc || ' | ' || 
                dayOfWeek || ' | ' || 
                startTime || ' - ' || 
                endTime || ' | '  as text_output
            FROM tb_doc_schedule
            ORDER BY id ASC;
        `;

    db.all(query, [], (err, rows) => {
      db.close();
      if (err) {
        reject(err);
        return;
      }
      // แปลง rows เป็น array ของ text
      const textOutput = String(rows.map((row) => row.text_output));
      resolve(String(textOutput));
    });
  });
}

async function addToCart(id_user, name_doc, date, startTime, endTime) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database("./restaurant.db");

    const query = `
            INSERT INTO tb_booking (id_user, name_doc, date,startTime,endTime)
            VALUES (?, ?, ?, ?, ?);
        `;

    db.run(
      query,
      [id_user, name_doc, date, startTime, endTime],
      function (err) {
        db.close();
        if (err) {
          reject(err);
          return;
        }
        resolve({ success: true, message: "Item added to cart successfully." });
      }
    );
  });
}

async function viewCart(idUser) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database("./restaurant.db");

    const query = `
            SELECT 
                name_doc || 'วันที่ ' || 
                date || 'เวลา :' || 
                startTime || ' - ' || 
                endTime || ' | '  as text_output
            FROM tb_booking
            WHERE id_user = ?
            ORDER BY date ASC;
        `;

    db.all(query, [idUser], (err, rows) => {
      db.close();
      if (err) {
        reject(err);
        return;
      }
      // แปลง rows เป็น array ของ text
      const textOutput = rows.map((row) => row.text_output).join("\n");
      resolve(textOutput);
    });
  });
}

async function clearCart(idUser) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database("./restaurant.db");

    const query = `
            DELETE FROM "tb_booking"
            WHERE tb_booking.id_user = ?;
        `;

    db.all(query, [idUser], (err, rows) => {
      db.close();
      if (err) {
        reject(err);
        return;
      }
      // แปลง rows เป็น array ของ text
      const textOutput = rows.map((row) => row.text_output).join("\n");
      resolve(textOutput);
    });
  });
}

async function checkUserExists(lineId) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database("./restaurant.db");

    const query = `
            SELECT COUNT(*) AS count FROM tb_user
            WHERE lineid = ?;
        `;

    db.get(query, [lineId], (err, row) => {
      db.close();
      if (err) {
        reject(err);
        return;
      }
      resolve(row.count > 0); // คืนค่า true ถ้าผู้ใช้มีอยู่แล้ว
    });
  });
}

// ฟังก์ชั่นสำหรับสร้างผู้ใช้ใหม่
async function createUser(lineId, username) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database("./restaurant.db");

    const query = `
            INSERT INTO tb_user (lineid, username, messages)
            VALUES (?, ?, ?);
        `;

    db.run(query, [lineId, username, JSON.stringify([])], function (err) {
      db.close();
      if (err) {
        reject(err);
        return;
      }
      resolve({ success: true, message: "User created successfully." });
    });
  });
}

// ฟังก์ชั่นสำหรับดึงข้อมูลข้อความของผู้ใช้
async function getUserMessages(lineId) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database("./restaurant.db");

    const query = `
            SELECT messages FROM tb_user
            WHERE lineid = ?;
        `;

    db.get(query, [lineId], (err, row) => {
      db.close();
      if (err) {
        reject(err);
        return;
      }
      if (row) {
        resolve(JSON.parse(row.messages));
      } else {
        resolve({ success: false, message: "User not found." });
      }
    });
  });
}

// ฟังก์ชั่นสำหรับอัปเดตข้อความของผู้ใช้
async function updateUserMessage(lineId, newMessage) {
  return new Promise(async (resolve, reject) => {
    try {
      const db = new sqlite3.Database("./restaurant.db");

      const query = `
                UPDATE tb_user
                SET messages = ?
                WHERE lineid = ?;
            `;

      db.run(query, [JSON.stringify(newMessage), lineId], function (err) {
        db.close();
        if (err) {
          reject(err);
          return;
        }
        resolve({
          success: true,
          message: "User messages updated successfully.",
        });
      });
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
  clearCart,
  viewAllSchedule,
  addToCart,
  viewCart,
  createUser,
  getUserMessages,
  updateUserMessage,
  checkUserExists,
  getUserByLineId,
};
