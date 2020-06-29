'use strict';

/**
 * Create a middleware that adds a send404 function to res
 *
 * @return {function}
 * @public
 */
const send404 = () => {
  return (req, res, next) => {
    res.send404 = () => {
      const err = new Error(`not found: '${req.originalUrl}'`);
      err.status = 404;
      next(err);
      return;
    };

    next();
  };
};

module.exports = send404;
