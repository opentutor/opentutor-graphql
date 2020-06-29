'use strict';

const objectsToIdArray = require('../utils/object-ids-to-array');

/**
 * Create a middleware that adds a sendObject function to res
 *
 * 'sendObject' should then be called instead of, say, res.json.
 * Depending on the request 'accepts' headers, may send either json, protobuf, etc.
 *
 * @param {object} [options]
 *  'convertIdObjectsToIdArray': if TRUE then converts the response
 *      for requests with query param fields=_id to a simple array of string ids,
 *      the unpolished response would have this format: [{ _id: "id1" }, { _id: "id2" }, ... ]
 *      and the polished response has this format [ "id1", "id2" ]
 * @return {function}
 * @deprecated
 * @public
 */

const sendObject = options => {
  const opts = {};

  // exclude type option
  if (options) {
    for (const prop in options) {
      if (prop !== 'type') {
        opts[prop] = options[prop];
      }
    }
  }

  if (typeof opts.convertIdObjectsToIdArray === 'undefined') {
    opts.convertIdObjectsToIdArray = true;
  }

  return function sendObject(req, res, next) {
    res.sendObject = function(obj) {
      if (
        opts.convertIdObjectsToIdArray &&
        (req.query.fields === '_id' || req.query.fields == 'id')
      ) {
        obj = objectsToIdArray(obj);
      }
      res.json(obj);
    };
    next();
  };
};

module.exports = sendObject;
