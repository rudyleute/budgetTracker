const validateFields = (body, reqAllowedFields, optAllowedFields) => {
  const fields = [];
  const values = [];

  for (const field of reqAllowedFields) {
    if (body[field] === undefined) {
      return {
        error: `${field} is mandatory`,
        missingField: field
      };
    }
    fields.push(field);
    values.push(body[field]);
  }

  for (const field of optAllowedFields) {
    if (body[field] === undefined) continue;

    fields.push(field);
    values.push(body[field]);
  }

  return { fields, values };
}

async function handleUpsert(options, db, logger) {
  const {
    req,
    res,
    entityName,
    reqAllowedFields,
    optAllowedFields,
    additionalValidation,
    buildQuery,
  } = options;

  try {
    const uid = req.user.uid;
    const { id } = req.params;
    const isUpdate = !!id; //id is undefined for post
    const operation = isUpdate ? 'update' : 'creation';

    if (!req.body || typeof req.body !== 'object') {
      logger.warn(`${entityName} ${operation} attempted with missing or invalid body`, { uid });
      return res.status(400).json({ message: "Request body is required" });
    }

    if (additionalValidation) {
      const validationError = await additionalValidation(db, req, uid);
      if (validationError) {
        logger.warn(`${entityName} ${operation} failed validation`, {
          uid,
          [`${entityName}Id`]: id,
          ...validationError.context
        });
        return res.status(400).json({ message: validationError.message });
      }
    }

    const { fields, values, error, missingField } =
      validateFields(req.body, reqAllowedFields, optAllowedFields);

    if (error) {
      logger.warn(`${entityName} ${operation} missing required field`, {
        uid,
        missingField,
        [`${entityName}Id`]: id
      });
      return res.status(400).json({ message: error });
    }

    logger.info(`${isUpdate ? 'Updating' : 'Creating'} ${entityName}`, {
      uid,
      [`${entityName}Id`]: id,
      body: req.body
    });

    const { query, queryValues } = buildQuery({
      fields,
      values,
      uid,
      id,
      isUpdate
    });

    const result = await db.query(query, queryValues);

    if (result.rows.length === 0 && isUpdate) {
      logger.warn(`${entityName} not found for update`, {
        uid,
        [`${entityName}Id`]: id
      });
      return res.status(404).json({ message: `${entityName} not found` });
    }

    logger.info(`${entityName} ${isUpdate ? 'updated' : 'created'} successfully`, {
      uid,
      [`${entityName}Id`]: result.rows[0].id
    });

    return res.status(isUpdate ? 200 : 201).json(result.rows[0]);

  } catch (error) {
    const { id } = req.params;
    logger.error(`Failed to ${id ? 'update' : 'create'} ${entityName}`, {
      error: error.message,
      stack: error.stack,
      uid: req.user.uid,
      [`${entityName}Id`]: id,
      body: req.body
    });
    res.status(500).json({ message: `Failed to ${id ? 'update' : 'create'} ${entityName}` });
  }
}

module.exports = handleUpsert;