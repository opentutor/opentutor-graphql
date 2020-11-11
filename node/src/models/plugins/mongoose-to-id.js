/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
const isHex = require('is-hex');
const mongoose = require('mongoose');
/**
 * Checks if a given object is of type ObjectId.
 * If it isn't, looks for an object id in property _id.
 * @param obj either an ObjectId or an object that contains an ObjectId property _id
 * @returns the _id property of the given object or the object itself
 */
function toIdPlugin(schema) {
  const toId = (obj) => {
    if (obj instanceof mongoose.Types.ObjectId) {
      return obj;
    }
    if (!obj) {
      return obj;
    }
    if (obj._id) {
      return obj._id;
    }
    if (obj.id) {
      return obj.id;
    }
    if (obj.length === 24 && isHex(obj)) {
      try {
        return mongoose.Types.ObjectId(obj);
      } catch (castErr) {
        console.log(`cast error for id '${obj}': ${castErr}`);
      }
    }

    return obj;
  };
  schema.statics.toId = toId;
  schema.methods.toId = toId;
}
module.exports = toIdPlugin;
