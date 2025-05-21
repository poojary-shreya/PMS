
import express from 'express';
import {getAllTrainingVideos,
    addTrainingVideo,
    updateTrainingVideo,
    deleteTrainingVideo,
    getTrainingVideosByCategoryAndContent
} from '../controller/videoController.js';

const router = express.Router();


router.get('/training-videos', getAllTrainingVideos);

router.post('/training-videos',  addTrainingVideo);


router.put('/training-videos/:id',  updateTrainingVideo);


router.delete('/training-videos/:id',  deleteTrainingVideo);


router.get('/training-videos/category/:category/content/:content', getTrainingVideosByCategoryAndContent);

export default router;