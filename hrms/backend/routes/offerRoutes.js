import express from "express";
import {
  createOffer,
  sendOfferEmail,
  getPendingApprovalOffers,
  submitForApproval,
  approveOffer,
  rejectOffer,
  sendApprovedOffer,
  getApprovedOffers,
  downloadOfferLetter,
  getRejectedOffers,
  getOfferById

} from "../controller/offerController.js";

const router = express.Router();


router.post("/", createOffer);

router.post('/send-offer-email', sendOfferEmail);

router.get('/pending-approval', getPendingApprovalOffers);
router.get('/view/:id', getOfferById);

router.put('/:offerId/submit-for-approval', submitForApproval);
router.put('/:offerId/approve', approveOffer);
router.put('/:offerId/reject', rejectOffer);
router.post('/:offerId/send', sendApprovedOffer);
router.get('/approved', getApprovedOffers); 
router.get('/download/:filePath', downloadOfferLetter);
// In your routes file
router.get('/rejected', getRejectedOffers);


export default router;