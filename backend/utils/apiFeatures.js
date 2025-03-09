
class APIFeatures {
  constructor(query, queryStr) {
    this.query = query
    this.queryStr = queryStr
  }

  // Filtering
  filter() {
    const queryObj = { ...this.queryStr }
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    // Advanced filtering
    let queryStr = JSON.stringify(queryObj)
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)

    this.query = this.query.find(JSON.parse(queryStr))

    return this
  }

  // Sorting
  sort() {
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.split(',').join(' ')
      this.query = this.query.sort(sortBy)
    } else {
      this.query = this.query.sort('-createdAt')
    }

    return this
  }

  // Field limiting
  limitFields() {
    if (this.queryStr.fields) {
      const fields = queryStr.fields.split(',').join(' ')
      this.query = this.query.select(fields)
    } else {
      this.query = this.query.select('-__v')
    }

    return this
  }

  // Pagination
  paginate() {
    const page = this.queryStr.page * 1 || 1;
    const limitNo = this.queryStr.limit * 1 || 20;
    const skipNo = (page - 1) * limitNo;
    this.query = this.query.skip(skipNo).limit(limitNo);

    return this;
  }
}

module.exports = APIFeatures;