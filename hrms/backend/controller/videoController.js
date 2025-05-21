

import TrainingVideo from '../model/videomodel.js';
import Training from '../model/trainingmodel.js';


export const getAllTrainingVideos = async (req, res) => {
  try {
    const videos = await TrainingVideo.findAll({
      where: { isActive: true },
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json(videos);
  } catch (error) {
    console.error('Error fetching training videos:', error);
    res.status(500).json({
      message: 'Failed to fetch training videos',
      error: error.message
    });
  }
};

export const addTrainingVideo = async (req, res) => {
  try {
    const { title, videoUrl, skillCategory, skillContent, description } = req.body;
    
    if (!title || !videoUrl || !skillCategory || !skillContent) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    if (!youtubeRegex.test(videoUrl)) {
      return res.status(400).json({ message: 'Invalid YouTube URL' });
    }
    
    const video = await TrainingVideo.create({
      title,
      videoUrl,
      skillCategory,
      skillContent,
      description,
      createdBy: req.session?.email || 'admin'
    });
    
    
    await updateMatchingTrainings(skillCategory, skillContent, videoUrl);
    
    res.status(201).json({
      message: 'Training video added successfully',
      video
    });
  } catch (error) {
    console.error('Error adding training video:', error);
    res.status(500).json({
      message: 'Failed to add training video',
      error: error.message
    });
  }
};


export const updateTrainingVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, videoUrl, skillCategory, skillContent, description, isActive } = req.body;
    
    const video = await TrainingVideo.findByPk(id);
    
    if (!video) {
      return res.status(404).json({ message: 'Training video not found' });
    }
    
    if (videoUrl) {
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
      if (!youtubeRegex.test(videoUrl)) {
        return res.status(400).json({ message: 'Invalid YouTube URL' });
      }
    }
    
    const oldCategory = video.skillCategory;
    const oldContent = video.skillContent;
    
    await video.update({
      title: title || video.title,
      videoUrl: videoUrl || video.videoUrl,
      skillCategory: skillCategory || video.skillCategory,
      skillContent: skillContent || video.skillContent,
      description: description !== undefined ? description : video.description,
      isActive: isActive !== undefined ? isActive : video.isActive
    });
    
   
    if (oldCategory !== video.skillCategory || oldContent !== video.skillContent) {
      await updateMatchingTrainings(video.skillCategory, video.skillContent, video.videoUrl);
    }
    
    res.status(200).json({
      message: 'Training video updated successfully',
      video
    });
  } catch (error) {
    console.error('Error updating training video:', error);
    res.status(500).json({
      message: 'Failed to update training video',
      error: error.message
    });
  }
};


export const deleteTrainingVideo = async (req, res) => {
  try {
    const { id } = req.params;
    
    const video = await TrainingVideo.findByPk(id);
    
    if (!video) {
      return res.status(404).json({ message: 'Training video not found' });
    }
    
    await video.update({ isActive: false });
    
    res.status(200).json({
      message: 'Training video deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting training video:', error);
    res.status(500).json({
      message: 'Failed to delete training video',
      error: error.message
    });
  }
};


export const getTrainingVideosByCategoryAndContent = async (req, res) => {
  try {
    const { category, content } = req.params;
    
    const videos = await TrainingVideo.findAll({
      where: {
        skillCategory: category,
        skillContent: content,
        isActive: true
      }
    });
    
    res.status(200).json(videos);
  } catch (error) {
    console.error('Error fetching training videos:', error);
    res.status(500).json({
      message: 'Failed to fetch training videos',
      error: error.message
    });
  }
};


async function updateMatchingTrainings(category, content, videoUrl) {
  try {
    const matchingTrainings = await Training.findAll({
      where: {
        skillCategory: category,
        skillContent: content,
        videoUrl: null 
      }
    });
    
    for (const training of matchingTrainings) {
      await training.update({ videoUrl });
    }
    
    return true;
  } catch (error) {
    console.error('Error updating matching trainings:', error);
    return false;
  }
}


export const findSuitableVideo = async (skillCategory, skillContent) => {
  try {
    const video = await TrainingVideo.findOne({
      where: {
        skillCategory,
        skillContent,
        isActive: true
      }
    });
    
    return video?.videoUrl || null;
  } catch (error) {
    console.error('Error finding suitable video:', error);
    return null;
  }
};