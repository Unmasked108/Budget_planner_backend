const express = require('express');
const router = express.Router();
const Income = require('../models/Income');
const { authMiddleware } = require('../middleware/authMiddleware');

// Route to save income data
router.post('/save-incomes', authMiddleware, async (req, res) => {
  try {
    const incomeDataArray = req.body;
    const userId = req.user.id;
    console.log(userId)
    const savedIncomes = await Promise.all(
      incomeDataArray.map(incomeData => {
        const newIncome = new Income({
          user: userId,
          month: incomeData.month,
          source: incomeData.source,
          amount: incomeData.amount,
          investments: incomeData.investments
        });
        return newIncome.save();
      })
    );
    res.status(200).json({ message: 'Incomes saved successfully', data: savedIncomes });
  } catch (error) {
    res.status(500).json({ message: 'Error saving income data', error });
  }
});

// Route to get income data for the logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(userId)

    const incomes = await Income.find({ user: userId });
    res.status(200).json({ data: incomes });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching income data', error });
  }
});

module.exports = router;
