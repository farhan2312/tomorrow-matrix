// Server-only R2 (S3-compatible) helpers for the admin media console.
import { S3Client, DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not configured on the server.`);
  return v;
}

function client(): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: `https://${env("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env("R2_ACCESS_KEY_ID"),
      secretAccessKey: env("R2_SECRET_ACCESS_KEY"),
    },
  });
}

export function publicUrl(path: string): string {
  return `${env("R2_PUBLIC_BASE").replace(/\/$/, "")}/${path}`;
}

/** Presigned PUT URL so the browser can upload the file straight to R2. */
export async function presignPut(path: string, contentType: string, expiresIn = 600): Promise<string> {
  const cmd = new PutObjectCommand({ Bucket: env("R2_BUCKET"), Key: path, ContentType: contentType });
  return getSignedUrl(client(), cmd, { expiresIn });
}

export async function deleteObject(path: string): Promise<void> {
  await client().send(new DeleteObjectCommand({ Bucket: env("R2_BUCKET"), Key: path }));
}
