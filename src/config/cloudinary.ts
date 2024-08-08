import { v2 as cloudinary } from "cloudinary";
import { config } from "./config";

cloudinary.config({
  cloud_name: config.CLOUDINART_URL,
  api_key: config.CLOUDINART_API_KEY,
  api_secret: config.CLOUDINART_SECRET,
});

export default cloudinary;
