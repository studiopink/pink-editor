const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const ReportModel = new Schema({
  data: Object, date: String,
  description: String
});

module.exports = mongoose.model('report', ReportModel);