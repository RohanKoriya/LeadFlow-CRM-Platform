import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  const ext = path.extname(file.originalname);

  if (ext !== ".csv") {
    cb(new Error("Only CSV files are allowed"));
    return;
  }

  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
});
