const express = require('express');
const router = express.Router();

const config = require('../config');
const shotstackService = require('../src/services/shotstack');
const fileService = require('../src/services/files');

router.use('/hook', require('./hook'));

router.post('/render', async (req, res, next) => {
    try {
        res.json(await shotstackService.render(req.body));
    } catch { next(err); }
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