import 'dotenv/config';
import chokidar from 'chokidar';
import {S3Client} from '@aws-sdk/client-s3';


const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const projectId = process.env.PROJECT_ID;
const bucketName = process.env.S3_BUCKET_NAME;
const localDirectory = '/workspace'
