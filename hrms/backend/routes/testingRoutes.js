

import express from 'express';
import {
  getAllTestQuestions,
  addTestQuestion,
  getTestQuestions,
  submitTest,
  addBulkTestQuestions,
  updateTestQuestion,
  deleteTestQuestion,
  getTestQuestionsByCategoryAndContent,
  getTestQuestionsByVideoId
} from '../controller/testingController.js';

import TestResult from '../model/testresult.js';

const router = express.Router();


router.get('/test-questions', getAllTestQuestions);
router.post('/test-questions', addTestQuestion);
router.get('/test-questions/:skillCategory/:skillContent', getTestQuestions);
router.post('/test-questions/bulk', addBulkTestQuestions);
router.put('/test-questions/:id', updateTestQuestion);
router.delete('/test-questions/:id', deleteTestQuestion);
router.get('/test-questions/category/:category/content/:content', getTestQuestionsByCategoryAndContent);
router.get('/test-questions/video/:videoId', getTestQuestionsByVideoId);


router.post('/test-questions/submit', submitTest);


router.get('/test-results/training/:trainingId/employee/:employeeId', async (req, res) => {
  try {
    const { trainingId, employeeId } = req.params;
    
    const testResult = await TestResult.findOne({
      where: {
        trainingId,
        employeeId
      },
      order: [['submissionDate', 'DESC']]
    });
    
    if (!testResult) {
      return res.status(404).json({
        message: 'No test results found for this training and employee'
      });
    }
    
    res.status(200).json({
      success: true,
      passed: testResult.passed,
      score: testResult.score,
      result: testResult
    });
  } catch (error) {
    console.error('Error fetching test results:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;