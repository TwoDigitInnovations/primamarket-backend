const multer = require('multer');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const path = require('path');
const crypto = require('crypto');

const s3Client = new S3Client({
  region: process.env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const storage = multer.memoryStorage();

const uploadToS3 = async (file, folder = 'Prima-easta') => {
  const fileExtension = path.extname(file.originalname);
  const fileName = `${folder}/${Date.now()}-${crypto.randomBytes(8).toString('hex')}${fileExtension}`;
  
  const isPDF = file.mimetype === 'application/pdf';
  
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    
    return `${process.env.AWS_ASSET_ROOT}/${fileName}`;
  } catch (error) {
    console.error('S3 Upload Error:', error);
    throw new Error('File upload to S3 failed');
  }
};

module.exports = {
  upload: multer({
    storage: storage,
    limits: { 
      fileSize: 10 * 1024 * 1024,     
      fieldSize: 25 * 1024 * 1024,     
      fieldNameSize: 100,             
      fields: 20                     
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new Error('Only image and PDF files are allowed!'), false);
      }
    }
  }),
  uploadToS3,
  s3Client
};
