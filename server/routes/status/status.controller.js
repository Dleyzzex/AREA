const express = require('express');
const router = express.Router();
const authorize = require('middleware/authorize');
const db = require('../../helpers/db');
const {sendMail} = require('../../actions/google.action');
const googleService = require('../auth/reddit.service');
const {sendOutlookMail, createOutlookEvent, getOutlookMail} = require('../../actions/microsoft.action');

// routes
router.get('/', status);

module.exports = router;

function status(req, res, next)
{
    res.json({message: 'Status Ok'});
}