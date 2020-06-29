'use strict';

/**
 * Very common to pass 'fields' query param as csv.
 * Mongoose needs fields to be space delimited,
 * so copies the req.query.fields to req.fields and converts ',' to ' '
 */

function fieldsParser() {
  return function(req, res, next) {
    if (req.query.fields) {
      req.fields = req.query.fields.replace(/,/g, ' ');
    }
    next();
  };
}

module.exports = fieldsParser;
