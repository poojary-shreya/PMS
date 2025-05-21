import Review from '../model/reviewmodel.js';
import Employee from '../model/addpersonalmodel.js';

export const createReview = async (req, res) => {
    try {
        
        const employee = await Employee.findOne({
            where: { employee_id: req.body.employee_id }
            
        });
          
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        
    
        const review = await Review.create({
            employee_id: req.body.employee_id,
            reviewer: req.body.reviewer,
            reviewDate: req.body.reviewDate,
            type: req.body.type,
            rating: req.body.rating,
            status: req.body.status || 'Scheduled',
            progress: req.body.progress || 0,
            comments: req.body.comments
        });
        
        const reviewWithEmployee = await Review.findByPk(review.id, {
            include: [{
                model: Employee,
                as:"personal",
                attributes: ['firstName', 'employee_id']
            }]
        });
        
        return res.status(201).json(reviewWithEmployee);
    } catch (error) {
        console.error('Error creating review:', error);
        return res.status(500).json({ message: 'Error creating review', error: error.message });
    }
};

export const getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.findAll({
            include: [{
                model: Employee,
                as:"personal",
                attributes: ['firstName', 'employee_id']
            }],
            order: [['createdAt', 'DESC']]
        });
        
        return res.status(200).json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return res.status(500).json({ error: 'Failed to fetch reviews' });
    }
};

export const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        
        const existingReview = await Review.findByPk(id);
        if (!existingReview) {
            return res.status(404).json({ message: 'Review not found' });
        }
        
        const updatedData = {};
        
        if (req.body.reviewer !== undefined) updatedData.reviewer = req.body.reviewer;
        if (req.body.reviewDate !== undefined) updatedData.reviewDate = req.body.reviewDate;
        if (req.body.type !== undefined) updatedData.type = req.body.type;
        if (req.body.rating !== undefined) updatedData.rating = req.body.rating;
        if (req.body.status !== undefined) updatedData.status = req.body.status;
        if (req.body.progress !== undefined) updatedData.progress = req.body.progress;
        if (req.body.comments !== undefined) updatedData.comments = req.body.comments;
        if (req.body.completionDetails !== undefined) updatedData.completionDetails = req.body.completionDetails;
        
      
        if (req.body.note) {
           
            const currentUpdates = existingReview.progressUpdates || [];
            
          
            const newUpdate = {
                date: new Date(),
                note: req.body.note,
                status: req.body.status || existingReview.status,
                progress: req.body.progress || existingReview.progress
            };
            
           
            updatedData.progressUpdates = [...currentUpdates, newUpdate];
        }
        
        if (req.body.employee_id) {
            const employee = await Employee.findOne({
                where: { employee_id: req.body.employee_id }
            });
            
            if (!employee) {
                return res.status(404).json({ message: 'Employee not found' });
            }
            
            updatedData.employee_id = req.body.employee_id;
        }
        
        await Review.update(updatedData, { where: { id } });
        
        const review = await Review.findByPk(id, {
            include: [{
                model: Employee,
                as: "personal",
                attributes: ['firstName', 'employee_id']
            }]
        });
        
        return res.status(200).json(review);
    } catch (error) {
        console.error('Error updating review:', error);
        return res.status(500).json({ error: 'Failed to update review', details: error.message });
    }
};

export const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const reviewToDelete = await Review.findByPk(id);
        
        if (!reviewToDelete) {
            return res.status(404).json({ message: 'Review not found' });
        }
        
        await reviewToDelete.destroy();
        
        return res.status(200).json({ success: true, message: 'Review deleted successfully' });
    } catch (error) {
        console.error('Error deleting review:', error);
        return res.status(500).json({ error: 'Failed to delete review' });
    }
};

export const getReviewsByEmployee = async (req, res) => {
    try {
        const { employee_id } = req.params;
        
        const employee = await Employee.findOne({
            where: { employee_id }
        });
        
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
       
        const loggedInEmail = req.session.email;
        
        if (!req.session.isCompanyEmail) {
            return res.status(403).json({ 
                error: "Access denied: Reviews can only be accessed when logged in with company email" 
            });
        }
        
       
        if (loggedInEmail !== employee.companyemail) {
            return res.status(403).json({ 
                error: "Access denied: You can only access reviews when logged in with your company email" 
            });
        }
        
        const reviews = await Review.findAll({
            where: { employee_id },
            include: [{
                model: Employee,
                as: "personal",
                attributes: ['firstName', 'lastName', 'employee_id']
            }],
            order: [['reviewDate', 'DESC']]
        });
        
        return res.status(200).json(reviews);
    } catch (error) {
        console.error('Error fetching employee reviews:', error);
        return res.status(500).json({ error: 'Failed to fetch employee reviews' });
    }
};



export const getEmployee = async (req, res) => {
    try {
        const { employee_id } = req.params;
        
        const employee = await Employee.findOne({
            where: { employee_id }
        });
        
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        
        return res.status(200).json(employee);
    } catch (error) {
        console.error('Error fetching employee:', error);
        return res.status(500).json({ error: 'Failed to fetch employee' });
    }
};
export const getReviews = async (req, res) => {
    try {
        const { employee_id } = req.params;
        
        const employee = await Employee.findOne({
            where: { employee_id }
        });
        const loggedInEmail = req.session.email;
        
        if (!req.session.isCompanyEmail) {
            return res.status(403).json({ 
                error: "Access denied: Reviews can only be accessed when logged in with company email" 
            });
        }
        
      
        if (loggedInEmail !== employee.companyemail) {
            return res.status(403).json({ 
                error: "Access denied: You can only access reviews when logged in with your company email" 
            });
        }
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        
        return res.status(200).json(employee);
    } catch (error) {
        console.error('Error fetching employee:', error);
        return res.status(500).json({ error: 'Failed to fetch employee' });
    }
};
export const getAllEmployees = async (req, res) => {
    try {
  
      const employees = await Employee.findAll({
        attributes: ['employee_id', 'firstName',],
        order: [['firstName', 'ASC']]
      });
      res.json(employees);
    } catch (error) {
      console.error("Error fetching all employees:", error);
      res.status(500).json({ error: error.message });
    }
  };
  