//dateParamNumber is needed for the interpolation in order to prevent injections
const formDefaultSelectQuery = (isChanged = false, dateParamNumber) => {
  const table = isChanged ? "changed" : "loans" //helps to prevent potential injections as the parameter is not pasted directly
  const alias = 't'

  //Calculate all the deadlines that are due to within 2 weeks
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const twoWeeksFromNow = new Date();
  twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);
  twoWeeksFromNow.setHours(23, 59, 59, 999);

  return {
    query: `
        SELECT ${alias}.id,
               ${alias}.name,
               ${alias}.timestamp,
               ${alias}.deadline,
               ${alias}.priority,
               ${alias}.type,
               ${alias}.sum,
               ${alias}.closed_at,
               json_build_object(
                       'id', cp.id,
                       'name', cp.name,
                       'email', cp.email,
                       'note', cp.note,
                       'phone', cp.phone
               )        AS counterparty,
               (CASE
                    WHEN ${alias}.priority = 'high' THEN true
                    WHEN ${alias}.closed_at IS NULL AND ${alias}.deadline IS NOT NULL AND DATE(${alias}.deadline) <= DATE($${dateParamNumber}) THEN true
                    ELSE false
               END) AS is_due /* All overdue loans and loans that will be overdue max in 2 weeks */
        FROM ${table} as ${alias}
                 LEFT JOIN counterparties cp ON ${alias}.counterparty_id = cp.id /*the semicolon is purposefully omitted as the query might be expanded*/
    `,
    alias,
    date: twoWeeksFromNow.toISOString()
  }
}

const buildPostQuery = ({ fields, values, uid }) => {
  const allFields = [...fields, "user_uid"];
  const allValues = [...values, uid];
  const placeholders = allValues.map((_, i) => `$${i + 1}`).join(", ");

  const defaultSelect = formDefaultSelectQuery(true, allValues.length + 1);
  allValues.push(defaultSelect.date) //date formed for calculating is_due

  const query = `
      WITH changed AS (
          INSERT INTO loans (${allFields.join(', ')})
              VALUES (${placeholders})
              RETURNING *
      )
      ${defaultSelect.query};
  `;

  return { query, queryValues: allValues };
}

const buildPatchQuery = ({ fields, values, uid, id }) => {
  let idx = 1;
  const setClauses = fields.map(f => `${f} = $${idx++}`);

  const uidPlaceholder = `$${idx++}`;
  const idPlaceholder = `$${idx++}`;

  const defaultSelect = formDefaultSelectQuery(true, idx);

  const query = `
      WITH changed AS (
          UPDATE loans
              SET ${setClauses.join(', ')}
              WHERE user_uid = ${uidPlaceholder} AND id = ${idPlaceholder}
              RETURNING *
      )
      ${defaultSelect.query};
  `;

  return { query, queryValues: [...values, uid, id, defaultSelect.date] };
}

module.exports = {
  buildPostQuery,
  buildPatchQuery,
  formDefaultSelectQuery
}