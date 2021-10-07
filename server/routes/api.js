const express = require('express');
const router = express.Router();

const config = require('../config');
const shotstackService = require('../src/services/shotstack');
const fileService = require('../src/services/files');

const ReportModel = require('../src/model/report');
const ObjectId = require('mongoose').Types.ObjectId;

router.use('/hook', require('./hook'));

router.post('/render', async (req, res, next) => {
    try {
        res.json(await shotstackService.render(req.body));
    } catch { next(err); }
});

router.post('/report', async (req, res, next) => {
    try {
        const reportData = JSON.parse(req.body.toString('utf8'));

        const data = new ReportModel({
            data: reportData.data,
            description: reportData.description,
            date: new Date().toISOString()
        });

        data.save();
        res.json({ status: 'ok', _id: data._id });
    } catch (err) { next(err); }
});

router.get('/reports', async (req, res, next) => {
    try {
        res.json(await ReportModel.find({}, '_id date description'));
    } catch (err) { next(err); }
});

router.get('/report/:id', async (req, res, next) => {
    try {
        res.json(await ReportModel.find({ _id: ObjectId(req.params.id) }));
    } catch (err) { next(err); }
});

router.post('/upload', async (req, res, next) => {
    try {
        res.json(await fileService.uploadFile(req));
    } catch (err) { next(err); }
});

router.post('/upload_subtitles', async (req, res, next) => {
    try {
        res.json(await fileService.uploadSubtitles(req));
    } catch (err) { next(err); }
});

module.exports = router;