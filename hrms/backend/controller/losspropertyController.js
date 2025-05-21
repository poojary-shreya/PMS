import PropertyLoss from '../model/losspropertymodel.js';
import SelfOccupiedProperty from '../model/selfoccufiedpropertymodel.js';
import LetOutProperty from '../model/letoutproperty.js';
import { sequelize } from '../config/db.js'; 


export const savePropertyLoss = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { 
      employeeId, 
      fiscalYear, 
      claimingLoss,
      selfOccupiedProperty,
      letOutProperty,
      selfOccupiedProperty1, 
      selfOccupiedProperty2, 
      letOutPropertyDetails 
    } = req.body;

  
    let propertyLoss = await PropertyLoss.findOne({ 
      where: { employeeId, fiscalYear },
      transaction 
    });

 
    if (!propertyLoss) {
      propertyLoss = await PropertyLoss.create({
        employeeId,
        fiscalYear,
        claimingLoss,
        selfOccupiedAmount: selfOccupiedProperty?.amount || 0,
        letOutLossAmount: letOutProperty?.lossAmount || 0,
        letOutIncomeAmount: letOutProperty?.incomeAmount || 0
      }, { transaction });
    } else {
      await propertyLoss.update({
        claimingLoss,
        selfOccupiedAmount: selfOccupiedProperty?.amount || 0,
        letOutLossAmount: letOutProperty?.lossAmount || 0,
        letOutIncomeAmount: letOutProperty?.incomeAmount || 0
      }, { transaction });
    }

 
    if (claimingLoss === 'Yes' && selfOccupiedProperty1) {
      const property1Data = {
        propertyLossId: propertyLoss.id,
        propertyNumber: 1,
        isFirstResidential: selfOccupiedProperty1.isFirstResidential,
        interestAmount: selfOccupiedProperty1.interestAmount || 0,
        address: selfOccupiedProperty1.address,
        occupationDate: selfOccupiedProperty1.occupationDate,
        city: selfOccupiedProperty1.city,
        loanSanctionDate: selfOccupiedProperty1.loanSanctionDate,
        houseValue: selfOccupiedProperty1.houseValue || 0,
        lenderName: selfOccupiedProperty1.lenderName,
        lenderAddress: selfOccupiedProperty1.lenderAddress,
        lenderPAN: selfOccupiedProperty1.lenderPAN
      };

      const [property1] = await SelfOccupiedProperty.findOrCreate({
        where: { propertyLossId: propertyLoss.id, propertyNumber: 1 },
        defaults: property1Data,
        transaction
      });

      if (property1 && property1.id) {
        await property1.update(property1Data, { transaction });
      }
    }


    if (claimingLoss === 'Yes' && selfOccupiedProperty2) {
      const property2Data = {
        propertyLossId: propertyLoss.id,
        propertyNumber: 2,
        isFirstResidential: selfOccupiedProperty2.isFirstResidential,
        interestAmount: selfOccupiedProperty2.interestAmount || 0,
        address: selfOccupiedProperty2.address,
        occupationDate: selfOccupiedProperty2.occupationDate,
        city: selfOccupiedProperty2.city,
        loanSanctionDate: selfOccupiedProperty2.loanSanctionDate,
        houseValue: selfOccupiedProperty2.houseValue || 0,
        lenderName: selfOccupiedProperty2.lenderName,
        lenderAddress: selfOccupiedProperty2.lenderAddress,
        lenderPAN: selfOccupiedProperty2.lenderPAN
      };

      const [property2] = await SelfOccupiedProperty.findOrCreate({
        where: { propertyLossId: propertyLoss.id, propertyNumber: 2 },
        defaults: property2Data,
        transaction
      });

      if (property2 && property2.id) {
        await property2.update(property2Data, { transaction });
      }
    }


    if (claimingLoss === 'Yes' && letOutPropertyDetails) {
      const letOutData = {
        propertyLossId: propertyLoss.id,
        address: letOutPropertyDetails.address,
        occupationDate: letOutPropertyDetails.occupationDate,
        rentalIncome: letOutPropertyDetails.rentalIncome || 0,
        municipalTax: letOutPropertyDetails.municipalTax || 0,
        netAnnualValue: letOutPropertyDetails.netAnnualValue || 0,
        repairsValue: letOutPropertyDetails.repairsValue || 0,
        netRentalIncome: letOutPropertyDetails.netRentalIncome || 0,
        interestOnLoan: letOutPropertyDetails.interestOnLoan || 0,
        totalInterestPaid: letOutPropertyDetails.totalInterestPaid || 0,
        lenderName: letOutPropertyDetails.lenderName,
        carryForwardLoss: letOutPropertyDetails.carryForwardLoss || 0,
        intraHeadSetOff: letOutPropertyDetails.intraHeadSetOff || 0,
        lenderAddress: letOutPropertyDetails.lenderAddress,
        lenderPAN: letOutPropertyDetails.lenderPAN
      };

      const [letOutProperty] = await LetOutProperty.findOrCreate({
        where: { propertyLossId: propertyLoss.id },
        defaults: letOutData,
        transaction
      });

      if (letOutProperty && letOutProperty.id) {
        await letOutProperty.update(letOutData, { transaction });
      }
    }

    await transaction.commit();
    
    return res.status(200).json({
      success: true,
      message: 'Property loss data saved successfully',
      data: { id: propertyLoss.id }
    });
    
  } catch (error) {
    await transaction.rollback();
    console.error('Error saving property loss data:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to save property loss data',
      error: error.message
    });
  }
};


export const getPropertyLossByEmployeeAndYear = async (req, res) => {
  try {
    const { employeeId, fiscalYear } = req.params;
    

    const propertyLoss = await PropertyLoss.findOne({
      where: { employeeId, fiscalYear },
      include: [
        {
          model: SelfOccupiedProperty,
          as: 'selfOccupiedProperties'
        },
        {
          model: LetOutProperty,
          as: 'letOutProperty'
        }
      ]
    });

    if (!propertyLoss) {
      return res.status(404).json({
        success: false,
        message: 'Property loss data not found'
      });
    }


    const formattedData = {
      id: propertyLoss.id,
      employeeId: propertyLoss.employeeId,
      fiscalYear: propertyLoss.fiscalYear,
      claimingLoss: propertyLoss.claimingLoss,
      selfOccupiedAmount: propertyLoss.selfOccupiedAmount,
      letOutLossAmount: propertyLoss.letOutLossAmount,
      letOutIncomeAmount: propertyLoss.letOutIncomeAmount
    };

    if (propertyLoss.selfOccupiedProperties && propertyLoss.selfOccupiedProperties.length > 0) {
      const property1 = propertyLoss.selfOccupiedProperties.find(p => p.propertyNumber === 1);
      const property2 = propertyLoss.selfOccupiedProperties.find(p => p.propertyNumber === 2);

      if (property1) {
        formattedData.selfOccupiedProperty1 = {
          isFirstResidential: property1.isFirstResidential,
          interestAmount: property1.interestAmount,
          address: property1.address,
          occupationDate: property1.occupationDate,
          city: property1.city,
          loanSanctionDate: property1.loanSanctionDate,
          houseValue: property1.houseValue,
          lenderName: property1.lenderName,
          lenderAddress: property1.lenderAddress,
          lenderPAN: property1.lenderPAN
        };
      }

      if (property2) {
        formattedData.selfOccupiedProperty2 = {
          isFirstResidential: property2.isFirstResidential,
          interestAmount: property2.interestAmount,
          address: property2.address,
          occupationDate: property2.occupationDate,
          city: property2.city,
          loanSanctionDate: property2.loanSanctionDate,
          houseValue: property2.houseValue,
          lenderName: property2.lenderName,
          lenderAddress: property2.lenderAddress,
          lenderPAN: property2.lenderPAN
        };
      }
    }

  
    if (propertyLoss.letOutProperty) {
      formattedData.letOutPropertyDetails = {
        address: propertyLoss.letOutProperty.address,
        occupationDate: propertyLoss.letOutProperty.occupationDate,
        rentalIncome: propertyLoss.letOutProperty.rentalIncome,
        municipalTax: propertyLoss.letOutProperty.municipalTax,
        netAnnualValue: propertyLoss.letOutProperty.netAnnualValue,
        repairsValue: propertyLoss.letOutProperty.repairsValue,
        netRentalIncome: propertyLoss.letOutProperty.netRentalIncome,
        interestOnLoan: propertyLoss.letOutProperty.interestOnLoan,
        totalInterestPaid: propertyLoss.letOutProperty.totalInterestPaid,
        lenderName: propertyLoss.letOutProperty.lenderName,
        carryForwardLoss: propertyLoss.letOutProperty.carryForwardLoss,
        intraHeadSetOff: propertyLoss.letOutProperty.intraHeadSetOff,
        lenderAddress: propertyLoss.letOutProperty.lenderAddress,
        lenderPAN: propertyLoss.letOutProperty.lenderPAN
      };
    }

    return res.status(200).json({
      success: true,
      data: formattedData
    });
    
  } catch (error) {
    console.error('Error fetching property loss data:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch property loss data',
      error: error.message
    });
  }
};

export const getAllPropertyLossesByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    const propertyLosses = await PropertyLoss.findAll({
      where: { employeeId },
      attributes: ['id', 'employeeId', 'fiscalYear', 'claimingLoss', 'createdAt', 'updatedAt'],
      order: [['fiscalYear', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      data: propertyLosses
    });
    
  } catch (error) {
    console.error('Error fetching employee property loss data:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch employee property loss data',
      error: error.message
    });
  }
};
export const getAllPropertyLosses = async (req, res) => {
  try {
    const propertyLosses = await PropertyLoss.findAll({
      attributes: ['id', 'employeeId', 'fiscalYear', 'claimingLoss', 'selfOccupiedAmount', 'letOutLossAmount', 'letOutIncomeAmount', 'createdAt', 'updatedAt'],
      order: [['updatedAt', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      data: propertyLosses
    });
    
  } catch (error) {
    console.error('Error fetching all property loss data:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch property loss data',
      error: error.message
    });
  }
};

export const deletePropertyLoss = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    

    const propertyLoss = await PropertyLoss.findByPk(id);
    
    if (!propertyLoss) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Property loss data not found'
      });
    }
    
 
    await SelfOccupiedProperty.destroy({
      where: { propertyLossId: id },
      transaction
    });
    
    await LetOutProperty.destroy({
      where: { propertyLossId: id },
      transaction
    });
    
 
    await propertyLoss.destroy({ transaction });
    
    await transaction.commit();
    
    return res.status(200).json({
      success: true,
      message: 'Property loss data deleted successfully'
    });
    
  } catch (error) {
    await transaction.rollback();
    console.error('Error deleting property loss data:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to delete property loss data',
      error: error.message
    });
  }
};