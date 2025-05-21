import path from 'path';
import { fileURLToPath } from 'url';
import InvestmentProof from '../model/InvestmentProofModel.js';
import Employee from '../model/addpersonalmodel.js';
import { Op } from 'sequelize';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getAllInvestmentProofs = async (req, res) => {
  try {
    const {
      employee_id,
      financial_year,
      category,
      status
    } = req.query;

    const whereClause = {};
    
    if (employee_id) whereClause.employee_id = employee_id;
    if (financial_year) whereClause.financial_year = financial_year;
    if (category) whereClause.category = category;
    if (status) whereClause.status = status;

    const investmentProofs = await InvestmentProof.findAll({
      where: whereClause,
      include: [
        {
          model: Employee,
          as: 'personal',
          attributes: ["employee_id", "firstName", "lastName"]
        }
      ],
      order: [['submitted_at', 'DESC']]
    });

    if (investmentProofs.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No investment proofs found',
        data: []
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Investment proofs retrieved successfully',
      data: investmentProofs
    });
  } catch (error) {
    console.error('Error retrieving investment proofs:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

export const updateInvestmentProofStatus = async (req, res) => {
  try {
    const { employee_id, category, status, reviewer_comment } = req.body;

    // Validate required fields
    if (!employee_id || !category || !status) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID, category, and status are required'
      });
    }

    // Validate status value
    const validStatuses = ['Pending', 'Approved', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value. Must be Pending, Approved, or Rejected.'
      });
    }

    // Find the investment proof
    const investmentProof = await InvestmentProof.findOne({
      where: {
        employee_id,
        category
      }
    });

    if (!investmentProof) {
      return res.status(404).json({
        success: false,
        message: 'Investment proof not found'
      });
    }

    // Update the status and reviewer comment
    investmentProof.status = status;
    investmentProof.reviewer_comment = reviewer_comment || '';
    investmentProof.reviewed_at = new Date();

    await investmentProof.save();

    return res.status(200).json({
      success: true,
      message: 'Investment proof status updated successfully',
      data: investmentProof
    });
  } catch (error) {
    console.error('Error updating investment proof status:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};






export const getPendingInvestmentProofs = async (req, res) => {
    try {
      const pendingProofs = await InvestmentProof.findAll({
        where: { status: 'Pending' },
        order: [['submitted_at', 'ASC']]
      });
  
      return res.status(200).json({
        success: true,
        message: 'Pending investment proofs retrieved successfully',
        data: pendingProofs
      });
    } catch (error) {
      console.error('Error retrieving pending investment proofs:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  };