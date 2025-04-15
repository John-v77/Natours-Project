const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const deleteOne = (Model) => catchAsync(async (req, res) => {

  console.log(Model, "document".bgMagenta)

  const doc = await Model.findByIdAndDelete(req.params.id);

  console.log(doc, "document".bgMagenta)
  if (!doc) {
    return next(new AppError('No document found with that ID', 404))
  }
  res.status(204).json({
    status: 'success',
    data: null
  });
})

module.exports = { deleteOne }