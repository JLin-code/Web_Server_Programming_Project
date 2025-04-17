const model = require('../models/friends');
const express = require('express');
const router = express.Router();

router
    .get('/:userId', (req, res, next) => {
        const { userId } = req.params;
        
        model.getFriends(userId)
            .then((data) => {
                res.send(data);
            })
            .catch(next);
    })
    .post('/:userId/add/:friendId', (req, res, next) => {
        const { userId, friendId } = req.params;
        
        model.addFriend(userId, friendId)
            .then((data) => {
                res.status(201).send(data);
            })
            .catch(next);
    })
    .delete('/:userId/remove/:friendId', (req, res, next) => {
        const { userId, friendId } = req.params;
        
        model.removeFriend(userId, friendId)
            .then((data) => {
                res.send(data);
            })
            .catch(next);
    });

module.exports = router;
