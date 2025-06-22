//super function -a function which pass function as input
const asyncHandler = (requestHandler) => (req, res, next) => {
  Promise.resolve(requestHandler(req, res)).catch((error) => next(error));
};

export default asyncHandler ;
