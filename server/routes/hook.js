const express = require('express');
const router = express.Router();
const shotstackService = require('../src/services/shotstack');

router.post('/render', (req, res) => {
    shotstackService.emitRender(req.body);
    
    res.json({ success: true });
});

module.exports = router;