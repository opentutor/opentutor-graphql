const mongoose = require('mongoose');
const isHex = require('is-hex');

/**
 * Find one record given a key which may be the _id for the record or an alias
 */
function findOneByIdOrAlias(schema) {
  /**
   * @param idOrAlias: the key to find, which may be an id (string or mongoose.Types.ObjectId) or an alias
   * @param fields: the select for the query, e.g. SomeModel.find(conditions).select(fields)... (optional)
   * @param callback - (optional) function(err, doc)
   * @return if callback passed, void if no callback passed, the query
   */
  schema.statics.findOneByIdOrAlias = function(idOrAlias, fields, callback) {
    if (typeof fields === 'function') {
      // Scenario: findWithLimit(conditions, callback)
      callback = fields;
      fields = null;
    }
    let id = null;
    if (idOrAlias instanceof mongoose.Types.ObjectId) {
      id = idOrAlias;
    } else if (idOrAlias.length === 24 && isHex(idOrAlias)) {
      try {
        id = mongoose.Types.ObjectId(idOrAlias);
      } catch (castErr) {
        console.log(`cast error for id '${idOrAlias}': ${castErr}`);
      }
    }
    let query = id
      ? this.findOne({ $or: [{ _id: id }, { alias: idOrAlias }] })
      : this.findOne({ alias: idOrAlias });
    if (fields) {
      fields = fields.replace(/,/g, ' ');
      query = query.select(fields);
    }
    return query.exec(callback);
  };
}

module.exports = findOneByIdOrAlias;
