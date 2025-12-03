function buildPostQuery({ fields, values, uid }) {
  const allFields = [...fields, "user_uid"];
  const allValues = [...values, uid];
  const placeholders = allValues.map((_, i) => `$${i + 1}`).join(", ");

  const query = `
      INSERT INTO categories (${allFields.join(", ")})
      VALUES (${placeholders})
      RETURNING id, color, name, created_at, updated_at;
  `;
  return { query, queryValues: allValues };
}

function buildPatchQuery({ fields, values, uid, id }) {
  let idx = 1;
  const setClauses = fields.map(f => `${f} = $${idx++}`);
  const uidPlaceholder = `$${idx++}`;
  const idPlaceholder = `$${idx}`;

  const query = `
      UPDATE categories
      SET ${setClauses.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE user_uid = ${uidPlaceholder} AND id = ${idPlaceholder}
      RETURNING id, color, name, created_at, updated_at;
  `;
  return { query, queryValues: [...values, uid, id] };
}

module.exports = {
  buildPostQuery,
  buildPatchQuery
}