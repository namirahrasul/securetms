const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const { requireAuth, checkUser } = require('../middleware/authMiddleware');
const taskController = require('../controllers/taskController');


router.get('*', checkUser);

router.get('/new', requireAuth, taskController.newtask_get);
// Get all the tasks
router.get('/all', requireAuth, taskController.alltasks_get);
// Get a Task by id
router.get('/edit/:taskId', taskController.singletask_edit_get);
//search by title
router.post('/search', taskController.searchtask_post);
//sort by highest priority
router.get('/sort/priority/highest', taskController.sorttask_priority_highest);

//sort by lowest priority
router.get('/sort/priority/lowest', taskController.sorttask_priority_lowest);
//sort by earliest due
router.get('/sort/due/earliest', taskController.sorttask_due_earliest);
//sort by lowest priority
router.get('/sort/due/latest', taskController.sorttask_due_latest )
//filter completed
router.get('/filter', taskController.filtertask)


// create a task
router.post('/new', requireAuth, taskController.newtask_post)
//edit task
router.post('/edit/:taskId',taskController.singletask_edit_post);
// mark complete
router.put('/complete/:taskId', taskController.singletask_complete)
// DELETE TODO
router.delete('/delete/:taskId', taskController.singletask_delete)
router.get('/categories', requireAuth, taskController.addCategory_get);
router.post('/categories', requireAuth, taskController.addCategory_post);

module.exports = router;