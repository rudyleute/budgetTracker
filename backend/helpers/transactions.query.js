function buildPostQuery({ fields, values, uid, id }) {
  const allFields = [...fields, "user_uid"];
  const allValues = [...values, uid];
  const placeholders = allValues.map((_, i) => `$${i + 1}`).join(", ");

  const query = `
      WITH inserted AS (
        INSERT INTO transactions (${allFields.join(", ")})
        VALUES (${placeholders})
        RETURNING *
      )
      SELECT inserted.id,
             inserted.timestamp,
             inserted.created_at,
             inserted.updated_at,
             inserted.name,
             inserted.price,
             json_build_object(
               'id', c.id,
               'name', c.name,
               'color', c.color
             ) AS category
      FROM inserted
      LEFT JOIN categories c ON inserted.category_id = c.id;
    `;

  return { query, queryValues: allValues };
}

function buildPatchQuery({ fields, values, uid, id }) {
  let idx = 1;
  const setClauses = fields.map(f => `${f} = $${idx++}`);
  const uidPlaceholder = `$${idx++}`;
  const idPlaceholder = `$${idx}`;

  const query = `
      WITH updated AS (
        UPDATE transactions
        SET ${setClauses.join(", ")}, updated_at = CURRENT_TIMESTAMP
        WHERE user_uid = ${uidPlaceholder} AND id = ${idPlaceholder}
        RETURNING *
      )
      SELECT updated.id,
             updated.timestamp,
             updated.created_at,
             updated.updated_at,
             updated.name,
             updated.price,
             json_build_object(
               'id', c.id,
               'name', c.name,
               'color', c.color
             ) AS category
      FROM updated
      LEFT JOIN categories c ON updated.category_id = c.id;
    `;
  return { query, queryValues: [...values, uid, id] };
}

module.exports = {
  buildPostQuery,
  buildPatchQuery
}