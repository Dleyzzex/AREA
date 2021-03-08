const express = require('express');
const router = express.Router();
const Joi = require('@hapi/joi');
const validateRequest = require('middleware/validate-request');
const authorize = require('middleware/authorize')
const Role = require('helpers/role');
const userService = require('./users.service');

router.get('/', authorize(Role.Admin), getAll);
router.get('/me', authorize(), getMe);
router.get('/:id', authorize(), getById);
router.put('/update_password', authorize(), updatePasswordSchema, updatePassword);
router.put('/update_email', authorize(), updateEmailSchema, updateEmail);

router.delete('/:id', authorize(), _delete);

module.exports = router;

function updatePasswordSchema(req, res, next) {
    const schema = Joi.object({
        password: Joi.string().required()
    });
    validateRequest(req, next, schema);
}

function updateEmailSchema(req, res, next) {
    const schema = Joi.object({
        email: Joi.string().required()
    });
    validateRequest(req, next, schema);
}

function getAll(req, res, next) {
    userService.getAll()
        .then((users) =>  res.json(users))
        .catch(next);
}

function getMe(req, res, next) {
    userService.getById(req.user.id)
    .then( user => user ? res.json(user) : res.sendStatus(404))
    .catch(next);
}

function getById(req, res, next) {
    // regular users can get their own record and admins can get any record
    if (req.params.id !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({message: 'Unauthorized'});
    }

    userService.getById(req.params.id)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(next);
}

function updatePassword(req, res, next) {
    const { password } = req.body;

    userService.updatePassword(req.user.id, password)
        .then(() => res.json({success: true}))
        .catch(next);
}

function updateEmail(req, res, next) {
    const { email } = req.body;
    userService.updateEmail(req.user.id, email)
        .then(() => res.json({success: true}))
        .catch(next);
}

function _delete(req, res, next) {
    // users can get their own refresh tokens and admins can get any user's refresh tokens
    if (req.params.id !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({message: 'Unauthorized'});
    }

    userService._delete(req.params.id)
        .then(() => res.json({message: 'User successfully deleted'}))
        .catch(next);
}