const { ZodError } = require("zod");

const validate = (schema, where = "body") => (req, res, next) => {
  try {
    schema.parse(req[where] || {});
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        error: "Validation failed",
        details: err.issues.map(i => ({
          path: i.path.join("."),
          message: i.message
        }))
      });
    }
    next(err);
  }
};

module.exports = validate;
