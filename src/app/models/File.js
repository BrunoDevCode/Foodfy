const db = require('../../config/db');
const fs = require('fs');
const { date } = require('../lib/utils');

module.exports = {
  create({ filename, path }) {
    let query = `
      INSERT INTO files (
        name,
        path,
        created_at
      ) VALUES ($1, $2, $3)
      RETURNING id
    `;

    const values = [filename, path, date(Date.now()).iso];

    return db.query(query, values);
  },

  find(id) {
    return db.query(`SELECT * FROM files WHERE id = $1`, [id]);
  },

  update({ filename, path, id }) {
    return db.query(
      `UPDATE files SET
        name=($1),
        path=($2)
      WHERE id = $3`,
      [filename, path, id]
    );
  },

  async delete(id) {
    try {
      let results = await db.query(`SELECT * FROM files WHERE id = $1`, [id]);
      const file = results.rows[0];

      fs.unlinkSync(file.path);

      await db.query('DELETE FROM recipe_files WHERE file_id = $1', [id]);
      return db.query('DELETE FROM files WHERE id = $1', [id]);
    } catch (err) {
      console.error(err);
    }
  },
};
