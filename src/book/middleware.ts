import multer from "multer";
import path from "node:path";

const upload = multer({
  dest: path.resolve(__dirname, "../../public/data/upload"),
  limits: { fieldSize: 3e7 },
});

const fileData = upload.fields([
  { name: "coverImage", maxCount: 1 },
  { name: "file", maxCount: 1 },
]);

export { fileData };
