const express = require('express');
const router = express.Router();
const Joi = require('@hapi/joi');
const validateRequest = require('middleware/validate-request');
const authorize = require('middleware/authorize');

const servicesService = require('./services.service');
router.get('/status', authorize(), status);
router.get('/', getAll);
router.get('/:id/action', getAction);
router.get('/:id/reaction', getReaction);

module.exports = router;

function status(req, res, next) {
    if (!req.user.id) {
        return res.status(401).json({message: 'Unauthorized'});
    }
    servicesService.status(req.user.id)
    .then(status => res.status(200).json(status))
    .catch(next);
}

function getAll(req, res, next) {
    servicesService.getAll()
    .then(services => res.json(services))
    .catch(next);
}

function getAction(req, res, next) {
    servicesService.getAction(req.params.id)
    .then(actions => res.json(actions))
    .catch(next)
}

function getReaction(req, res, next) {
    servicesService.getReaction(req.params.id)
    .then(reactions => res.json(reactions))
    .catch(next)
}