const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { validateTask } = require('../middleware/validation');
const {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
} = require('../controllers/taskController');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/', getAllTasks);
router.get('/:id', getTaskById);
router.post('/', validateTask, createTask);
router.put('/:id', validateTask, updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
