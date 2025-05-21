

import TestQuestion from '../model/testingmodel.js';
import TrainingVideo from '../model/videomodel.js';
import TestResult from '../model/testresult.js';
import Training from "../model/trainingmodel.js"

export const getAllTestQuestions = async (req, res) => {
  try {
    const questions = await TestQuestion.findAll({
      where: { isActive: true },
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: TrainingVideo,
          as: 'relatedVideo',
          attributes: ['id', 'title', 'videoUrl']
        }
      ]
    });
    
    res.status(200).json(questions);
  } catch (error) {
    console.error('Error fetching test questions:', error);
    res.status(500).json({
      message: 'Failed to fetch test questions',
      error: error.message
    });
  }
};


export const addTestQuestion = async (req, res) => {
  try {
    const { 
      question, 
      options, 
      correctAnswer, 
      explanation, 
      skillCategory, 
      skillContent, 
      difficulty,
      videoId 
    } = req.body;
    
   
    if (!question || !options || correctAnswer === undefined || !skillCategory || !skillContent) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
  
    if (!Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ message: 'At least two options are required' });
    }
   
    if (correctAnswer < 0 || correctAnswer >= options.length) {
      return res.status(400).json({ message: 'Correct answer index is invalid' });
    }
    
    
    let validatedVideoId = null;
    if (videoId && videoId !== "") {
      const video = await TrainingVideo.findByPk(videoId);
      if (!video) {
        return res.status(404).json({ message: 'Related training video not found' });
      }
      validatedVideoId = videoId;
    }
    
    const testQuestion = await TestQuestion.create({
      question,
      options,
      correctAnswer,
      explanation,
      skillCategory,
      skillContent,
      difficulty: difficulty || 'Medium',
      videoId: validatedVideoId,
      createdBy: req.session?.email || 'admin'
    });
    
    res.status(201).json({
      message: 'Test question added successfully',
      testQuestion
    });
  } catch (error) {
    console.error('Error adding test question:', error);
    res.status(500).json({
      message: 'Failed to add test question',
      error: error.message
    });
  }
};

export const getTestQuestions = async (req, res) => {
  try {
    const { skillCategory, skillContent } = req.params;
    
    const questions = await TestQuestion.findAll({
      where: {
        skillCategory,
        skillContent,
        isActive: true
      }
    });
    
    if (!questions || questions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No test questions found'
      });
    }
    
  
    const sanitizedQuestions = questions.map(({ id, question, options, skillCategory, skillContent }) => ({
      id, question, options, skillCategory, skillContent
    }));
    
    res.status(200).json({
      success: true,
      questions: sanitizedQuestions
    });
  } catch (error) {
    console.error('Error fetching test questions:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const submitTest = async (req, res) => {
  try {
    const { trainingId, employeeId, answers, skillCategory, skillContent } = req.body;


    const questions = await TestQuestion.findAll({
      where: {
        skillCategory,
        skillContent
      }
    });

    if (questions.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No questions found for this skill category and content"
      });
    }


    let correctAnswers = 0;
    questions.forEach(question => {
      if (answers[question.id] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const score = Math.round((correctAnswers / questions.length) * 100);
    const passed = score >= 70;


    const testResult = await TestResult.create({
      trainingId,
      employeeId,
      score,
      passed,
      answers,
      submissionDate: new Date()
    });

    res.json({
      success: true,
      passed,
      score,
      feedback: passed 
        ? "Congratulations! You passed the test." 
        : "Please review the materials and try again.",
      result: testResult
    });

  } catch (error) {
    console.error('Error submitting test:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const addBulkTestQuestions = async (req, res) => {
  try {
    const { questions } = req.body;
    
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'No questions provided for bulk addition' });
    }
    
 
    for (const q of questions) {
      const { 
        question, 
        options, 
        correctAnswer, 
        skillCategory, 
        skillContent 
      } = q;
      
      if (!question || !options || correctAnswer === undefined || !skillCategory || !skillContent) {
        return res.status(400).json({ message: 'Missing required fields in one or more questions' });
      }
      
      if (!Array.isArray(options) || options.length < 2) {
        return res.status(400).json({ message: 'At least two options are required for each question' });
      }
      
      if (correctAnswer < 0 || correctAnswer >= options.length) {
        return res.status(400).json({ message: 'Correct answer index is invalid in one or more questions' });
      }
      
    
      if (q.videoId && q.videoId !== "") {
        const video = await TrainingVideo.findByPk(q.videoId);
        if (!video) {
          return res.status(404).json({ message: `Related training video not found for question: ${question.substring(0, 30)}...` });
        }
      }
    }
    

    const createdQuestions = await Promise.all(
      questions.map(async (q) => {
      
        const videoId = q.videoId && q.videoId !== "" ? q.videoId : null;
        
        return TestQuestion.create({
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || "",
          skillCategory: q.skillCategory,
          skillContent: q.skillContent,
          difficulty: q.difficulty || 'Medium',
          videoId: videoId,
          createdBy: req.session?.email || 'admin'
        });
      })
    );
    
    res.status(201).json({
      message: `Successfully added ${createdQuestions.length} questions`,
      questions: createdQuestions
    });
  } catch (error) {
    console.error('Error adding bulk test questions:', error);
    res.status(500).json({
      message: 'Failed to add bulk test questions',
      error: error.message
    });
  }
};


export const updateTestQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      question, 
      options, 
      correctAnswer, 
      explanation, 
      skillCategory, 
      skillContent, 
      difficulty,
      videoId,
      isActive 
    } = req.body;
    
    const testQuestion = await TestQuestion.findByPk(id);
    
    if (!testQuestion) {
      return res.status(404).json({ message: 'Test question not found' });
    }
    
    if (options) {
      if (!Array.isArray(options) || options.length < 2) {
        return res.status(400).json({ message: 'At least two options are required' });
      }
      

      if (correctAnswer === undefined && testQuestion.correctAnswer >= options.length) {
        return res.status(400).json({ message: 'Existing correct answer index is no longer valid with new options' });
      }
    }
    
    if (correctAnswer !== undefined) {
      const optionsArray = options || testQuestion.options;
      if (correctAnswer < 0 || correctAnswer >= optionsArray.length) {
        return res.status(400).json({ message: 'Correct answer index is invalid' });
      }
    }
    
   
    let validatedVideoId = testQuestion.videoId;
    if (videoId === "") {
      validatedVideoId = null;
    } else if (videoId) {
      const video = await TrainingVideo.findByPk(videoId);
      if (!video) {
        return res.status(404).json({ message: 'Related training video not found' });
      }
      validatedVideoId = videoId;
    }
    
    await testQuestion.update({
      question: question || testQuestion.question,
      options: options || testQuestion.options,
      correctAnswer: correctAnswer !== undefined ? correctAnswer : testQuestion.correctAnswer,
      explanation: explanation !== undefined ? explanation : testQuestion.explanation,
      skillCategory: skillCategory || testQuestion.skillCategory,
      skillContent: skillContent || testQuestion.skillContent,
      difficulty: difficulty || testQuestion.difficulty,
      videoId: validatedVideoId,
      isActive: isActive !== undefined ? isActive : testQuestion.isActive
    });
    
    res.status(200).json({
      message: 'Test question updated successfully',
      testQuestion
    });
  } catch (error) {
    console.error('Error updating test question:', error);
    res.status(500).json({
      message: 'Failed to update test question',
      error: error.message
    });
  }
};


export const deleteTestQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    
    const testQuestion = await TestQuestion.findByPk(id);
    
    if (!testQuestion) {
      return res.status(404).json({ message: 'Test question not found' });
    }
    
    await testQuestion.update({ isActive: false });
    
    res.status(200).json({
      message: 'Test question deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting test question:', error);
    res.status(500).json({
      message: 'Failed to delete test question',
      error: error.message
    });
  }
};


export const getTestQuestionsByCategoryAndContent = async (req, res) => {
  try {
    const { category, content } = req.params;
    
    const questions = await TestQuestion.findAll({
      where: {
        skillCategory: category,
        skillContent: content,
        isActive: true
      },
      include: [
        {
          model: TrainingVideo,
          as: 'relatedVideo',
          attributes: ['id', 'title', 'videoUrl']
        }
      ]
    });
    
    res.status(200).json(questions);
  } catch (error) {
    console.error('Error fetching test questions:', error);
    res.status(500).json({
      message: 'Failed to fetch test questions',
      error: error.message
    });
  }
};


export const getTestQuestionsByVideoId = async (req, res) => {
  try {
    const { videoId } = req.params;
    
    const questions = await TestQuestion.findAll({
      where: {
        videoId,
        isActive: true
      }
    });
    
    res.status(200).json(questions);
  } catch (error) {
    console.error('Error fetching test questions for video:', error);
    res.status(500).json({
      message: 'Failed to fetch test questions',
      error: error.message
    });
  }
};