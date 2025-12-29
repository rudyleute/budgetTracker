function buildPostQuery({ fields, values, uid }) {
  const allFields = [...fields, "user_uid"];
  const allValues = [...values, uid];
  const placeholders = allValues.map((_, i) => `$${i + 1}`).join(", ");

  const query = `
      WITH inserted AS (
        INSERT INTO counterparties (${allFields.join(", ")})
        VALUES (${placeholders})
        RETURNING *
      )
      SELECT
          inserted.id,
          inserted.name,
          inserted.email,
          inserted.phone,
          inserted.note,
          COALESCE(
            SUM(CASE WHEN l.type = 'borrowed' THEN l.sum ELSE 0 END) -
            SUM(CASE WHEN l.type = 'lent' THEN l.sum ELSE 0 END),
            0
          ) AS balance
      FROM inserted
          LEFT JOIN loans l ON inserted.id = l.counterparty_id AND l.user_uid = $${allValues.length} AND l.closed_at IS NULL
      GROUP BY inserted.id, inserted.name, inserted.email, inserted.phone, inserted.note;
  `;

  return { query, queryValues: allValues };
}

function buildPatchQuery({ fields, values, uid, id }) {
  let idx = 1;
  const setClauses = fields.map(f => `${f} = $${idx++}`);

  const query = `
      WITH updated AS (
          UPDATE counterparties
              SET ${setClauses.join(", ")}, updated_at = CURRENT_TIMESTAMP
              WHERE user_uid = $${idx} AND id = $${idx + 1}
          RETURNING *
      )
      SELECT
          updated.id,
          updated.name,
          updated.email,
          updated.phone,
          updated.note,
          COALESCE(
                  SUM(CASE WHEN l.type = 'borrowed' THEN l.sum ELSE 0 END) -
                  SUM(CASE WHEN l.type = 'lent' THEN l.sum ELSE 0 END),
                  0
          ) AS balance
      FROM updated
               LEFT JOIN loans l ON updated.id = l.counterparty_id AND l.user_uid = $${idx} AND l.closed_at IS NULL
      GROUP BY updated.id, updated.name, updated.email, updated.phone, updated.note;
    `;

  return { query, queryValues: [...values, uid, id] };
}

module.exports = {
  buildPostQuery,
  buildPatchQuery
}