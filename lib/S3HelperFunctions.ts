import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { runWithAmplifyServerContext } from "@/utils/amplify-server-utils";
import { fetchAuthSession } from "aws-amplify/auth/server";

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const ALLOWED_FORMATS = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
const MAX_FILE_SIZE = 1048576 * 10; // 10 MB

function generateFileName(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex");
}

export async function generateSignedURLs(
  request: NextRequest,
  files: { fileType: string; fileSize: number }[]
) {
  let username : unknown ;
  const response = NextResponse.next();

  const authenticated = await runWithAmplifyServerContext({
    nextServerContext: { request, response },
    operation: async (contextSpec) => {
      try {
        const session = await fetchAuthSession(contextSpec);
        username =
          session.tokens?.idToken?.payload?.["cognito:username"] ||
          session.tokens?.accessToken?.payload?.username;
        return (
          session.tokens?.accessToken !== undefined &&
          session.tokens?.idToken !== undefined
        );
      } catch (error) {
        console.error(error);
        return false;
      }
    },
  });

  if (!authenticated) {
    return { failure: "not authenticated" };
  }

  const invalidFile = files.find(
    (file) =>
      !ALLOWED_FORMATS.includes(file.fileType) || file.fileSize > MAX_FILE_SIZE
  );

  if (invalidFile) {
    return { failure: `Invalid file: ${invalidFile.fileType} or exceeds size limit` };
  }

  const signedURLs = await Promise.all(
    files.map(async (file) => {
      const fileKey = `uploads/${username}/${generateFileName()}-${file.fileType.split("/")[1]}`;
      const putObjectCommand = new PutObjectCommand({
        Bucket: process.env.NEXT_PUBLIC_S3_BUCKET!,
        Key: fileKey,
        ContentType: file.fileType,
        ContentLength: file.fileSize,
      });

      const url = await getSignedUrl(s3Client, putObjectCommand, { expiresIn: 300 });
      return { fileKey, url };
    })
  );

  return signedURLs;
}
