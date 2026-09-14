import 'dotenv/config';
import chokidar from 'chokidar';
import {createReadStream} from 'node:fs';
import {mkdir, readdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {
    DeleteObjectCommand,
    GetObjectCommand,
    ListObjectsV2Command,
    PutObjectCommand,
    S3Client
} from '@aws-sdk/client-s3';


const projectId = process.env.PROJECT_ID;
const bucketName = process.env.S3_BUCKET_NAME;
const localDirectory = process.env.LOCAL_DIRECTORY || '/workspace';

if (!projectId || !bucketName) {
    throw new Error('PROJECT_ID and S3_BUCKET_NAME are required');
}

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const getS3Key = (filePath) => {
    const relativePath = path.relative(localDirectory, filePath);
    return `${projectId}/${relativePath.split(path.sep).join('/')}`;
};

const isIgnoredPath = (filePath) => filePath
    .split(/[\\/]/)
    .some((segment) => segment.startsWith('.') || segment === 'node_modules');

const getLocalFiles = async (directory) => {
    const entries = await readdir(directory, {withFileTypes: true});
    const files = [];

    for (const entry of entries) {
        const filePath = path.join(directory, entry.name);

        if (isIgnoredPath(filePath)) {
            continue;
        }

        if (entry.isDirectory()) {
            files.push(...await getLocalFiles(filePath));
        } else if (entry.isFile()) {
            files.push(filePath);
        }
    }

    return files;
};

const getRemoteFiles = async () => {
    const remoteFiles = new Map();
    let continuationToken;

    do {
        const response = await s3Client.send(new ListObjectsV2Command({
            Bucket: bucketName,
            Prefix: `${projectId}/`,
            ContinuationToken: continuationToken
        }));

        for (const object of response.Contents || []) {
            if (object.Key && !object.Key.endsWith('/')) {
                remoteFiles.set(object.Key, object);
            }
        }

        continuationToken = response.IsTruncated
            ? response.NextContinuationToken
            : undefined;
    } while (continuationToken);

    return remoteFiles;
};

const downloadFile = async (key) => {
    const relativePath = key.slice(`${projectId}/`.length);
    const filePath = path.join(localDirectory, ...relativePath.split('/'));
    const response = await s3Client.send(new GetObjectCommand({
        Bucket: bucketName,
        Key: key
    }));

    await mkdir(path.dirname(filePath), {recursive: true});
    await writeFile(filePath, await response.Body.transformToByteArray());
    console.log(`Restored s3://${bucketName}/${key} to ${filePath}`);
};

const initialSync = async () => {
    await mkdir(localDirectory, {recursive: true});
    const remoteFiles = await getRemoteFiles();

    await Promise.all([...remoteFiles.keys()].map(downloadFile));

    const localFiles = await getLocalFiles(localDirectory);
    const missingRemoteFiles = localFiles.filter((filePath) => !remoteFiles.has(getS3Key(filePath)));

    await Promise.all(missingRemoteFiles.map(uploadFile));
    console.log(`Initial sync complete: restored ${remoteFiles.size} file(s), uploaded ${missingRemoteFiles.length} file(s)`);
};

const uploadFile = async (filePath) => {
    const key = getS3Key(filePath);

    await s3Client.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: createReadStream(filePath)
    }));

    console.log(`Synced ${filePath} to s3://${bucketName}/${key}`);
};

const deleteFile = async (filePath) => {
    const key = getS3Key(filePath);

    await s3Client.send(new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key
    }));

    console.log(`Deleted s3://${bucketName}/${key}`);
};

await initialSync();

const watcher = chokidar.watch(localDirectory, {
    ignored: isIgnoredPath,
    ignoreInitial: true,
    awaitWriteFinish: {
        stabilityThreshold: 500,
        pollInterval: 100
    }
});

watcher
    .on('add', (filePath) => uploadFile(filePath).catch(console.error))
    .on('change', (filePath) => uploadFile(filePath).catch(console.error))
    .on('unlink', (filePath) => deleteFile(filePath).catch(console.error))
    .on('ready', () => console.log(`Watching ${localDirectory} for project ${projectId}`))
    .on('error', (error) => console.error('File watcher error:', error));
