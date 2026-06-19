import { v2 as cloudinary } from 'cloudinary';
import configKeys from '../../config';

cloudinary.config({
  cloud_name: configKeys.CLOUDINARY_CLOUD_NAME,
  api_key: configKeys.CLOUDINARY_API_KEY,
  api_secret: configKeys.CLOUDINARY_API_SECRET,
});

export const cloudinaryService = () => {
  const uploadFile = async (file: Express.Multer.File) => {
    const result = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: 'auto' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(file.buffer);
    });
    return {
      name: file.originalname,
      key: result.public_id,
      url: result.secure_url,
    };
  };

  const uploadAndGetUrl = uploadFile;

  const getFile = async (fileKey: string) => {
    return cloudinary.url(fileKey);
  };

  const getVideoStream = async (key: string): Promise<any> => {
    return cloudinary.url(key, { resource_type: 'video' });
  };

  const getCloudFrontUrl = async (fileKey: string) => {
    return cloudinary.url(fileKey);
  };

  const removeFile = async (fileKey: string) => {
    await cloudinary.uploader.destroy(fileKey);
  };

  return {
    uploadFile,
    uploadAndGetUrl,
    getFile,
    getVideoStream,
    getCloudFrontUrl,
    removeFile,
  };
};

export type CloudServiceImpl = typeof cloudinaryService;