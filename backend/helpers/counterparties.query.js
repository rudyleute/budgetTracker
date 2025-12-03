function buildPostQuery({ fields, values, uid }) {
  const allFields = [...fields, "user_uid"];
  const allValues = [...values, uid];
  const placeholders = allValues.map((_, i) => `$${i + 1}`).join(", ");

  const query = `
      INSERT INTO counterparties (${allFields.join(", ")})
      VALUES (${placeholders})
      RETURNING id, name, email, note, phone
  `;

  return { query, queryValues: allValues };
}

function buildPatchQuery({ fields, values, uid, id }) {
  let idx = 1;
  const setClauses = fields.map(f => `${f} = $${idx++}`);

  const query = `
      UPDATE counterparties
      SET ${setClauses.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE user_uid = $${idx} AND id = $${idx + 1}
      RETURNING id, name, email, note, phone;
    `;

  return { query, queryValues: [...values, uid, id] };
}

module.exports = {
  buildPostQuery,
  buildPatchQuery
}