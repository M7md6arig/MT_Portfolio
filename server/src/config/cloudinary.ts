// env must load first: the cloudinary SDK snapshots CLOUDINARY_URL when imported,
// which is before dotenv has run otherwise.
import "./env";
import { v2 as cloudinary } from "cloudinary";

// true = re-read CLOUDINARY_URL from the (now dotenv-populated) environment.
cloudinary.config(true);
cloudinary.config({ secure: true });

export { cloudinary };
