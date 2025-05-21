import Interview from "./model/interviewmodel.js";
import Offer from "./model/offermodel.js";
import { Candidate } from "./model/trackingmodel.js";
import Onboarding from './model/onboardingmodel.js';
import OnboardingDocument from './model/docmodel.js';
import Employee from "./model/addpersonalmodel.js"
// Associations
Interview.belongsTo(Candidate, { foreignKey: 'candidateId' });
Candidate.hasMany(Interview, { foreignKey: 'candidateId' });

Interview.hasOne(Offer, { foreignKey: 'interviewId' });
Offer.belongsTo(Interview, { foreignKey: 'interviewId' });


Onboarding.hasMany(OnboardingDocument, {
  foreignKey: 'onboardingId',
  as: 'documents' 
});

OnboardingDocument.belongsTo(Onboarding, {
  foreignKey: 'onboardingId',
  as: 'onboarding'
});

// Add association between Onboarding and Employee
Onboarding.belongsTo(Employee, {
  foreignKey: 'employee_id',
  as: 'employee'
});

export { Onboarding, OnboardingDocument ,Employee};