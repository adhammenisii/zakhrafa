// Express 4 does not catch rejections thrown from async route handlers — an unhandled
// rejection leaves the request hanging with no response. Wrapping handlers in this
// forwards errors to the error middleware in server.js instead.
export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}
