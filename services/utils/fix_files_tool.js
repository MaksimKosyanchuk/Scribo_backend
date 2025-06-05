require('dotenv').config();
const AWS = require('aws-sdk');
const axios = require('axios');
const path = require('path');
const { get_users } = require('../users.services');
const { get_posts } = require('../posts.services');
const User = require('../../models/User');
const Post = require('../../models/Post');

AWS.config.update({
  accessKeyId: process.env.AWS_CONNECT_ACCESS_KEY, 
  secretAccessKey: process.env.AWS_CONNECT_SECRET_ACCESS_KEY,
  region: process.env.AWS_CONNECT_REGION
});

const s3 = new AWS.S3();

const BUCKET_NAME = process.env.AWS_CONNECT_BUCKET_NAME;
const AVATAR_PREFIX = 'src/avatar/';
const FEATURED_PREFIX = 'src/featured_image/';

async function listS3FilesWithKeys(prefix) {
  const params = {
    Bucket: BUCKET_NAME,
    Prefix: prefix
  };

  let allFiles = [];
  let ContinuationToken = null;

  do {
    const data = await s3.listObjectsV2({
      ...params,
      ContinuationToken
    }).promise();

    const files = data.Contents.map(item => ({
      Key: item.Key,
      fileName: item.Key.split('/').pop()
    }));

    allFiles = allFiles.concat(files);
    ContinuationToken = data.IsTruncated ? data.NextContinuationToken : null;
  } while (ContinuationToken);

  return allFiles;
}

function extractFileNameFromUrl(url) {
  if (!url) return null;
  return url.split('/').pop();
}

async function deleteS3Files(bucket, keys) {
  if (keys.length === 0) {
    console.log('No files to delete.');
    return;
  }

  const chunks = [];
  for (let i = 0; i < keys.length; i += 1000) {
    chunks.push(keys.slice(i, i + 1000));
  }

  for (const chunk of chunks) {
    const deleteParams = {
      Bucket: bucket,
      Delete: {
        Objects: chunk.map(key => ({ Key: key })),
        Quiet: false
      }
    };

    const response = await s3.deleteObjects(deleteParams).promise();
    console.log(`Deleted ${response.Deleted.length} files.`);
    if (response.Errors.length > 0) {
      console.error('Errors during deletion:', response.Errors);
    }
  }
}

function getContentTypeByFilename(filename) {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.gif':
      return 'image/gif';
    default:
      return 'application/octet-stream';
  }
}

async function fixFeaturedImagesInS3() {
  const s3Files = await listS3FilesWithKeys(FEATURED_PREFIX);

  const timestampRegex = /^\d+\.[a-zA-Z0-9]+$/;

  for (const file of s3Files) {
    const fileName = file.fileName;

    if (!timestampRegex.test(fileName)) {
      console.log(`File ${file.Key} name does not match timestamp format, fixing...`);

      const fileData = await s3.getObject({ Bucket: BUCKET_NAME, Key: file.Key }).promise();

      const ext = path.extname(fileName);
      const newFileName = `${Date.now()}${ext}`;
      const newKey = FEATURED_PREFIX + newFileName;

      await s3.putObject({
        Bucket: BUCKET_NAME,
        Key: newKey,
        Body: fileData.Body,
        ContentType: getContentTypeByFilename(newFileName),
      }).promise();

      await s3.deleteObject({ Bucket: BUCKET_NAME, Key: file.Key }).promise();

      console.log(`Renamed ${fileName} -> ${newFileName}`);

      await Post.updateMany(
        { featured_image: { $regex: fileName } },
        { $set: { featured_image: `https://${BUCKET_NAME}.s3.${process.env.AWS_CONNECT_REGION}.amazonaws.com/${FEATURED_PREFIX}${newFileName}` } }
      );

      console.log(`Updated database references for posts with old image name ${fileName}`);
    }
  }
}

async function cleanupUnusedS3Files() {
  try {
    const s3AvatarFiles = await listS3FilesWithKeys(AVATAR_PREFIX);
    const s3FeaturedFiles = await listS3FilesWithKeys(FEATURED_PREFIX);

    const usersData = await get_users();
    const users = usersData.data || [];

    const postsData = await get_posts();
    const posts = postsData.data || [];

    console.log('Fixing user avatars...');

    console.log('Fixing post featured_images...');
    await fixFeaturedImagesInS3(posts);

    const updatedUsersData = await get_users();
    const updatedUsers = updatedUsersData.data || [];

    const updatedPostsData = await get_posts();
    const updatedPosts = updatedPostsData.data || [];

    const usedAvatarsSet = new Set();
    for (const user of updatedUsers) {
      if (user.avatar && user.avatar.includes(BUCKET_NAME)) {
        const fileName = extractFileNameFromUrl(user.avatar);
        if (fileName) usedAvatarsSet.add(fileName);
      }
    }

    const usedFeaturedSet = new Set();
    for (const post of updatedPosts) {
      if (post.featured_image && post.featured_image.includes(BUCKET_NAME)) {
        const fileName = extractFileNameFromUrl(post.featured_image);
        if (fileName) usedFeaturedSet.add(fileName);
      }
    }

    const unusedAvatars = s3AvatarFiles.filter(file => !usedAvatarsSet.has(file.fileName));
    const unusedFeaturedImages = s3FeaturedFiles.filter(file => !usedFeaturedSet.has(file.fileName));

    console.log('Deleting unused avatar files:');
    unusedAvatars.forEach(f => console.log(` - ${f.Key}`));
    await deleteS3Files(BUCKET_NAME, unusedAvatars.map(f => f.Key));

    console.log('Deleting unused featured_image files:');
    unusedFeaturedImages.forEach(f => console.log(` - ${f.Key}`));
    await deleteS3Files(BUCKET_NAME, unusedFeaturedImages.map(f => f.Key));

    console.log('Cleanup complete.');
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

module.exports = { cleanupUnusedS3Files };
