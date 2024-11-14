// pages/api/generate-presigned-url.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { S3Client, GetObjectCommand, PutObjectCommand, GeneratePresignedUrlCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { fileName, fileType } = req.body;

    if (!fileName || !fileType) {
      return res.status(400).json({ error: 'File name and file type are required' });
    }

    const params = {
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET!,
      Key: `uploads/${fileName}`,
      ContentType: fileType,
    };

    try {
      // Generate the pre-signed URL
      const command = new PutObjectCommand(params);
      const presignedUrl = await s3Client.getSignedUrl(command, { expiresIn: 3600 }); // URL valid for 1 hour

      res.status(200).json({ url: presignedUrl });
    } catch (error) {
      console.error('Error generating pre-signed URL:', error);
      res.status(500).json({ error: 'Failed to generate pre-signed URL' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
