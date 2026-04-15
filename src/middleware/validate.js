const { z } = require('zod');

/**
 * Validate request using a Zod schema
 * Usage: validate(schema) or validate({ body: schema, query: schema, params: schema })
 */
const validate = (schemas) => {
  return (req, res, next) => {
    try {
      // Support single schema (defaults to body) or object with body/query/params
      if (schemas.body || schemas.query || schemas.params) {
        if (schemas.body) req.body = schemas.body.parse(req.body);
        if (schemas.query) req.query = schemas.query.parse(req.query);
        if (schemas.params) req.params = schemas.params.parse(req.params);
      } else {
        req.body = schemas.parse(req.body);
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = { validate };
