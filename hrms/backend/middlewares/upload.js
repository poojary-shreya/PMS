import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueFilename = `${Date.now()}-${file.originalname}`;
    file.storedFilename = `uploads/${uniqueFilename}`;
    cb(null, uniqueFilename);
  },
});

const upload = multer({ storage });

export const uploadFiles = upload.fields([
  { name: "panCardFile", maxCount: 1 },
  { name: "adharCardFile", maxCount: 1 },
  { name: "qualificationFile", maxCount: 10 },
  { name: "certificationFile", maxCount: 10 },
]);

export default upload;
