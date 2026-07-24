import type { RoleName } from "@prisma/client";
import { uploadBuffer } from "../config/cloudinary";
import { documentRepository } from "../repositories/document.repository";
import { NotFoundError, ValidationError } from "../utils/AppError";
import { getPagination, toPaginated } from "../utils/pagination";
import { createAuditLog } from "./audit.service";

export const documentService = {
  async upload(
    user: { id: string; role: RoleName },
    file: Express.Multer.File | undefined,
    meta: {
      ownerType: never;
      ownerId: string;
      type?: never;
      startupId?: string;
      projectId?: string;
      companyRegId?: string;
      freelancerId?: string;
      name?: string;
    }
  ) {
    if (!file) throw new ValidationError("File is required");

    const uploaded = await uploadBuffer(file.buffer, {
      folder: "misfit/documents",
      filename: `${Date.now()}_${file.originalname.replace(/\s+/g, "_")}`,
      mimeType: file.mimetype,
    });

    const doc = await documentRepository.create({
      name: meta.name ?? file.originalname,
      originalName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      url: uploaded.url,
      cloudinaryId: uploaded.publicId,
      type: meta.type ?? "OTHER",
      ownerType: meta.ownerType,
      ownerId: meta.ownerId,
      uploader: { connect: { id: user.id } },
      ...(meta.startupId
        ? { startup: { connect: { id: meta.startupId } } }
        : {}),
      ...(meta.projectId
        ? { project: { connect: { id: meta.projectId } } }
        : {}),
      ...(meta.companyRegId
        ? { companyRegistration: { connect: { id: meta.companyRegId } } }
        : {}),
      ...(meta.freelancerId
        ? { freelancer: { connect: { id: meta.freelancerId } } }
        : {}),
    });

    await createAuditLog({
      userId: user.id,
      action: "FILE_UPLOAD",
      entityType: "Document",
      entityId: doc.id,
    });

    return doc;
  },

  async list(
    user: { id: string; role: RoleName },
    query: {
      page?: number;
      limit?: number;
      ownerType?: string;
      ownerId?: string;
      type?: string;
    }
  ) {
    const { skip, take, page, limit } = getPagination(query);
    const { items, total } = await documentRepository.list({
      skip,
      take,
      uploaderId: user.role === "ADMIN" ? undefined : user.id,
      ownerType: query.ownerType as never,
      ownerId: query.ownerId,
      type: query.type as never,
    });
    return toPaginated(items, total, page, limit);
  },

  async remove(id: string, user: { id: string; role: RoleName }) {
    const doc = await documentRepository.findById(id);
    if (!doc) throw new NotFoundError("Document not found");
    if (user.role !== "ADMIN" && doc.uploaderId !== user.id) {
      throw new NotFoundError("Document not found");
    }
    await documentRepository.softDelete(id);
    return { id };
  },
};
