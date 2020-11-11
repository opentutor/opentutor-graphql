/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
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
  schema.statics.findOneByIdOrAlias = function (idOrAlias, fields, callback) {
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
