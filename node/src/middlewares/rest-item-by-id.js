'use strict';

/**
 * @typedef findOneCallback
 * @param {Error} err
 * @param {Object} item
 */
/**
 * Create a route that finds and returns a single item by id
 * with 404 and error handling
 *
 * @param {findOneCallback} opts.findOne
 * @param {string} opts.id_param
 * @param TODO {async function} opts.transform - async function performs a transform on the item before send
 */
const restItemById = opts => {
  opts = opts || {};

  return (req, res, next) => {
    const id = req.params[opts.id_param || 'id'];

    opts.findOne(id, (err, item) => {
      if (err) {
        return next(err); //res.status(500).send(err)
      }

      if (!item) {
        return res.send404();
      }

      // if(opts.transform) {
      //   try {
      //     item = await opts.transform(item)
      //   }
      //   catch(transformErr) {
      //     res.status(500).send(transformErr)
      //     return
      //   }
      // }

      return res.sendObject(item);
    });
  };
};

module.exports = restItemById;
