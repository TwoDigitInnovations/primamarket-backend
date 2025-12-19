const { uploadToS3 } = require('../services/s3Upload');

const uploadToCloudinary = async (file, folder = 'Prima-easta') => {
  try {
    const url = await uploadToS3(file, folder);
    return url;
  } catch (error) {
    throw new Error('Image upload failed');
  }
};

const uploadMultipleToCloudinary = async (files, folder = 'Prima-easta') => {
  try {
    const uploadPromises = files.map(file => uploadToS3(file, folder));
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    throw new Error('Multiple images upload failed');
  }
};

module.exports = { uploadToCloudinary, uploadMultipleToCloudinary };