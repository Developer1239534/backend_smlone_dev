const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dgvzkkyds',
  api_key: process.env.CLOUDINARY_API_KEY || '571887411963597',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'smlone'
});

module.exports = cloudinary;
