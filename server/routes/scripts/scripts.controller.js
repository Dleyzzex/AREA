const { func } = require('@hapi/joi');
const express = require('express');
const router = express.Router();

const authorize = require('middleware/authorize');
const scriptsService = require('./scripts.service');

router.get('/', authorize(), getAll);
router.post('/create', authorize(), create);
router.delete('/:id', authorize(), _delete);
router.post('/:id/update', authorize(), update);

module.exports = router;

function getAll(req, res, next) {
    scriptsService.getAll(req.user.id)
    .then((scripts) =>  res.json(scripts))
    .catch(next);
}

function create(req, res, next) {
    const { action_id, reaction_id, action_parameters, reaction_parameters, trigger, name } = req.body;
    scriptsService.create(req.user.id, action_id, reaction_id, action_parameters, reaction_parameters, trigger, name)
    .then(() => res.status(200).json({success: true}))
    .catch(next);
}

function update(req, res, next) {
    const {status} = req.body;
    scriptsService.update(req.params.id, status)
    .then(script => script ? res.json(script) : res.status(404).json({success: false}))
    .catch(next);
}

function _delete(req, res, next) {
    scriptsService._delete(req.params.id)
    .then(() => res.status(200).json({success: true}))
    .catch(next);
}