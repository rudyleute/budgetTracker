function buildPostQuery({ fields, values, uid }) {
  const allFields = [...fields, "user_uid"];
  const allValues = [...values, uid];
  const placeholders = allValues.map((_, i) => `$${i + 1}`).join(", ");

  const query = `
      WITH inserted AS (
          INSERT INTO loans (${allFields.join(', ')})
              VALUES (${placeholders})
              RETURNING *
      )
      SELECT inserted.id,
             inserted.name,
             inserted.timestamp,
             inserted.deadline,
             inserted.priority,
             inserted.type,
             inserted.price,
             json_build_object(
                     'id', cp.id,
                     'name', cp.name,
                     'email', cp.email,
                     'note', cp.note,
                     'phone', cp.phone
             ) AS counterparty
      FROM inserted
               LEFT JOIN counterparties cp ON inserted.counterparty_id = cp.id;
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
          UPDATE loans
              SET ${setClauses.join(', ')}
              WHERE user_uid = ${uidPlaceholder} AND id = ${idPlaceholder}
              RETURNING *
      )
      SELECT updated.id,
             updated.name,
             updated.timestamp,
             updated.deadline,
             updated.priority,
             updated.type,
             updated.price,
             json_build_object(
                     'id', cp.id,
                     'name', cp.name,
                     'email', cp.email,
                     'note', cp.note,
                     'phone', cp.phone
             ) AS counterparty
      FROM updated
               LEFT JOIN counterparties cp ON updated.counterparty_id = cp.id;
  `;

  return { query, queryValues: [...values, uid, id] };
}

module.exports = {
  buildPostQuery,
  buildPatchQuery
}