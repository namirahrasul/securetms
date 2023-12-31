const Task = require('../models/task');
const mongoose = require('mongoose');
const jwtMiddleware = require('../middleware/authMiddleware');


const handleErrors = (err) => {
  console.log("Entering handleErrors function");
  console.log("err", err);

  let errors = { title: '', due_date: '' };

  // Check if the error is due to task validation failure
  if (err.message.includes('task validation failed')) {
    Object.values(err.errors).forEach(({ properties }) => {
      // Check specific error messages and set corresponding fields
      if (properties.path === 'title') {
        errors.title = properties.message;
      } else if (properties.path === 'due_date') {
        errors.due_date = properties.message;
      }
    });
  }

  return errors;
};

function newtask_get(req, res) {
  res.render('create-task');
}
async function alltasks_get(req, res) {
 try {
   const data = await Task.find().select({});
   if(data){
     const categories = await Task.getCategories();
     res.render('browse-tasks', { data: data ,categories: categories});
   }
   else {
      res.render('browse-tasks', { data: data, categories: [] });
    }
 } catch (err) {
  const errors = handleErrors(err);
  res.status(400).send({errors})
 }
}
async function newtask_post(req, res) {
 const { title,description,priority,due_date} = req.body;
 try {
  const task = await Task.create({ title,description,priority,due_date });
  res.status(202).json({ task: task._id });

 } catch (err) {
   
   const errors = handleErrors(err);
   console.log("Server-side errors:", errors); 
  res.status(400).json({errors});
 }
}
async function singletask_edit_get(req, res){
  try {
    const task = await Task.findById(req.params.taskId);
    res.render('edit-task', { taskId: req.params.taskId , task: task });
  } catch (err) {
    console.log('Failed to fetch data');
    console.log(err.message);
    res.status(400).send('Failed to fetch data');
  }
}
async function singletask_edit_post(req, res) {
  const taskId = req.params.taskId; 
  const { title, description, priority, category, due_date } = req.body;

  try {
    // Find the existing task by ID
    const existingTask = await Task.findById(taskId);

    if (!existingTask) {
      // Handle case where the task with the given ID is not found
      return res.status(404).json({ error: 'Task not found' });
    }

    // Update the fields if they are provided in the request
    if (title) {
      existingTask.title = title;
    }

    if (description) {
      existingTask.description = description;
    }

    if (priority) {
      existingTask.priority = priority;
    }

    if (category) {
      existingTask.category = category;
    }

    if (due_date) {
      existingTask.due_date = due_date;
    }

    // Save the updated task
    const updatedTask = await existingTask.save();

    // Respond with the updated task details
    res.status(200).json({ task: updatedTask });
  } catch (err) {
    console.log(err)
    // res.status(400).json({ error: err.message });
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
}

async function singletask_complete(req, res){
  await Task.updateOne({ _id: req.params.taskId }, {
    $set: {
      status: "complete"
    }
  })
    .then(() => {
      console.log('Data were updated');
      res.send('Data were updated')
    })
    .catch((err) => {
      console.log('Failed to update');
      res.send('Failed to update')
    });
}

async function singletask_delete(req, res){
  console.log("taskId", req.params.taskId)
  await Task.deleteOne({ _id: req.params.taskId })
    .then(() => {
      console.log('Data were deleted');
      res.status(205).send('task deleted successfully');
    })
    .catch((err) => {
      console.log('Failed to deleted\n', err.message);
      res.status(400).send('task deleted failed');
    });
}

async function searchtask_post(req, res) {
  try {
    jwtMiddleware.checkUser(req, res, async (err) => {
      if (err) {
        console.error('Error decoding JWT:', err);
        throw err;
      }

      const { search } = req.body;
      console.log("req.body.search", search);
      const searchRegex = new RegExp(`.*${search}.*`, 'i');
      console.log("searchRegex", searchRegex);
      const data = await Task.find({ title: { $regex: searchRegex } }).select({});
      if(data){
        const categories = await Task.getCategories();
        res.render('browse-tasks', { user: res.locals.user, admin: res.locals.admin, data: data, categories: categories });
      }
      else
      {
        res.render('browse-tasks', { user: res.locals.user, admin: res.locals.admin,data: data, categories: [] });
      }
    });
  } catch (err) {
    console.log('Failed to return search results');
    res.status(400).send('Failed to return search results');
  }
}
async function sorttask_priority_highest(req, res){
  try {
    jwtMiddleware.checkUser(req, res, async (err) => {
      if (err) {
        console.error('Error decoding JWT:', err);
        throw err;
      }

      const data = await Task.sortByHighestPriority();
      console.log("data", data);
      if (data) {
        const categories = await Task.getCategories();
        res.render('browse-tasks', { user: res.locals.user, admin: res.locals.admin, data: data, categories: categories });
      }
      else {
        res.render('browse-tasks', { user: res.locals.user, admin: res.locals.admin, data: data, categories: [] });
      }
    });
  } catch (err) {
    console.log('Failed to sort');
    res.status(400).send('Failed to sort');
  }
}
async function sorttask_priority_lowest(req, res){
  try {
    jwtMiddleware.checkUser(req, res, async (err) => {
      if (err) {
        console.error('Error decoding JWT:', err);
        throw err;
      }

      const data = await Task.sortByLowestPriority();
      console.log("data", data);
      if (data) {
        const categories = await Task.getCategories();
        res.render('browse-tasks', { user: res.locals.user, admin: res.locals.admin, data: data, categories: categories });
      }
      else {
        res.render('browse-tasks', { user: res.locals.user, admin: res.locals.admin, data: data, categories: [] });
      }
    });
  } catch (err) {
    console.log('Failed to sort');
    res.status(400).send('Failed to sort');
  }
}
async function sorttask_due_earliest(req, res){
  try {
    jwtMiddleware.checkUser(req, res, async (err) => {
      if (err) {
        console.error('Error decoding JWT:', err);
        throw err;
      }

      const data = await Task.sortByEarliestDue();
      console.log("data", data);
      if (data) {
        const categories = await Task.getCategories();
        res.render('browse-tasks', { user: res.locals.user, admin: res.locals.admin, data: data, categories: categories });
      }
      else {
        res.render('browse-tasks', { user: res.locals.user, admin: res.locals.admin, data: data, categories: [] });
      }
    });
  } catch (err) {
    console.log('Failed to sort');
    res.status(400).send('Failed to sort');
  }
}
async function sorttask_due_latest(req, res){
  try {
    jwtMiddleware.checkUser(req, res, async (err) => {
      if (err) {
        console.error('Error decoding JWT:', err);
        throw err;
      }

      const data = await Task.sortByLatestDue();
      console.log("data", data);
      if (data) {
        const categories = await Task.getCategories();
        res.render('browse-tasks', { user: res.locals.user, admin: res.locals.admin, data: data, categories: categories });
      }
      else {
        res.render('browse-tasks', { user: res.locals.user, admin: res.locals.admin, data: data, categories: [] });
      }
    });
  } catch (err) {
    console.log('Failed to sort');
    res.status(400).send('Failed to sort');
  }
}
async function filtertask(req, res) {
  try {
    jwtMiddleware.checkUser(req, res, async (err) => {
      if (err) {
        console.error('Error decoding JWT:', err);
        throw err;
      }
      const filterFields = {};

      if (req.query.status && req.query.status.length !== 0) {
        filterFields.status = req.query.status;
      }
      if (req.query.priority && req.query.priority.length !== 0) {
        filterFields.priority = req.query.priority;
      }
      if (req.query.category && req.query.category.length !== 0) {
        filterFields.category = req.query.category;
      }
  
      console.log(filterFields);
      const data = await Task.find(filterFields).select({})
      if (data) {
        const categories = await Task.getCategories();
        res.render('browse-tasks', { user: res.locals.user, admin: res.locals.admin, data: data, categories: categories });
      }
      else {
        res.render('browse-tasks', { user: res.locals.user, admin: res.locals.admin, data: data, categories: [] });
      }
    });
  } catch (err) {
    console.log('Failed to filter results');
    res.status(400).send('Failed to filter results');
  }
}
async function addCategory_get (req, res){
    res.render('category');
}
async function addCategory_post (req, res){
  const { category } = req.body;

  try {
    const updatedTask = await Task.findOneAndUpdate(
      {},
      { $addToSet: { categories: category } },
      { new: true }
    );

    res.redirect('/all')
  } catch (error) {
    console.error('Error adding category:', error);
    res.status(400).send('Failed to add category')
  }
}

module.exports = {
 newtask_get,
 alltasks_get,
 newtask_post,
 singletask_edit_get,
 singletask_edit_post,
 singletask_delete,
 singletask_complete,
 searchtask_post,
  sorttask_priority_highest,
  sorttask_priority_lowest,
  sorttask_due_earliest,
  sorttask_due_latest,
  filtertask,
  addCategory_get,
  addCategory_post
}