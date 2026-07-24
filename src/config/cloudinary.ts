import { v2 as cloudinary } from "cloudinary";
import { env } from "./env";

const configured =
  Boolean(env.cloudinary.cloudName) &&
  Boolean(env.cloudinary.apiKey) &&
  Boolean(env.cloudinary.apiSecret);

if (configured) {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
    secure: true,
  });
}

export const isCloudinaryConfigured = configured;

export async function uploadBuffer(
  buffer: Buffer,
  options: {
    folder?: string;
    filename?: string;
    mimeType?: string;
  } = {}
): Promise<{ url: string; publicId: string }> {
  if (!configured) {
    const mockId = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    return {
      publicId: mockId,
      url: `https://res.cloudinary.com/demo/raw/upload/${options.folder ?? "misfit"}/${options.filename ?? mockId}`,
    };
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder ?? "misfit",
        resource_type: "auto",
        public_id: options.filename,
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
}

export { cloudinary };
