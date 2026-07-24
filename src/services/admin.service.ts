import type {
  AssignmentStatus,
  ConsultationStatus,
  StartupStatus,
  UserStatus,
} from "@prisma/client";
import { adminRepository } from "../repositories/admin.repository";
import { NotFoundError, ValidationError } from "../utils/AppError";
import { getPagination, toPaginated } from "../utils/pagination";
import { createAuditLog } from "./audit.service";

export const adminService = {
  analytics() {
    return adminRepository.frontendAnalytics();
  },

  async listUsers(query: {
    page?: number;
    limit?: number;
    pageSize?: number;
    status?: string;
    search?: string;
    role?: string;
  }) {
    const { skip, take, page, limit } = getPagination(query);
    const { items, total } = await adminRepository.listUsers({
      skip,
      take,
      status: query.status as never,
      search: query.search,
      role: query.role,
    });
    return toPaginated(items, total, page, limit);
  },

  async listStartups(query: {
    page?: number;
    limit?: number;
    pageSize?: number;
    status?: string;
  }) {
    const { skip, take, page, limit } = getPagination(query);
    const { items, total } = await adminRepository.listStartups({
      skip,
      take,
      status: query.status,
    });
    return toPaginated(items, total, page, limit);
  },

  async listFreelancers(query: {
    page?: number;
    limit?: number;
    pageSize?: number;
    verified?: string | boolean;
  }) {
    const { skip, take, page, limit } = getPagination(query);
    const verified =
      query.verified === undefined
        ? undefined
        : query.verified === true || query.verified === "true";
    const { items, total } = await adminRepository.listFreelancers({
      skip,
      take,
      verified,
    });
    return toPaginated(items, total, page, limit);
  },

  async listConsultations(query: {
    page?: number;
    limit?: number;
    pageSize?: number;
  }) {
    const { skip, take, page, limit } = getPagination(query);
    const { items, total } = await adminRepository.listConsultations({
      skip,
      take,
    });
    return toPaginated(items, total, page, limit);
  },

  async listProjects(query: {
    page?: number;
    limit?: number;
    pageSize?: number;
  }) {
    const { skip, take, page, limit } = getPagination(query);
    const { items, total } = await adminRepository.listProjects({ skip, take });
    return toPaginated(items, total, page, limit);
  },

  async listFounders(query: {
    page?: number;
    limit?: number;
    pageSize?: number;
  }) {
    const { skip, take, page, limit } = getPagination(query);
    const { items, total } = await adminRepository.listFounders({ skip, take });
    return toPaginated(items, total, page, limit);
  },

  async listDocuments(query: {
    page?: number;
    limit?: number;
    pageSize?: number;
  }) {
    const { skip, take, page, limit } = getPagination(query);
    const { items, total } = await adminRepository.listDocuments({
      skip,
      take,
    });
    return toPaginated(items, total, page, limit);
  },

  async listPendingApprovals(query: {
    page?: number;
    limit?: number;
    pageSize?: number;
  }) {
    const { skip, take, page, limit } = getPagination(query);
    const { items, total } = await adminRepository.listPendingApprovals({
      skip,
      take,
    });
    return toPaginated(items, total, page, limit);
  },

  async listAssignments(query: {
    page?: number;
    limit?: number;
    pageSize?: number;
    status?: string;
  }) {
    const { skip, take, page, limit } = getPagination(query);
    const { items, total } = await adminRepository.listAssignments({
      skip,
      take,
      status: query.status,
    });
    return toPaginated(items, total, page, limit);
  },

  async getUserDetail(id: string) {
    const user = await adminRepository.getUserDetail(id);
    if (!user) throw new NotFoundError("User not found");
    return user;
  },

  async getStartupDetail(id: string) {
    const startup = await adminRepository.getStartupDetail(id);
    if (!startup) throw new NotFoundError("Startup not found");
    return startup;
  },

  async getFreelancerDetail(id: string) {
    const freelancer = await adminRepository.getFreelancerDetail(id);
    if (!freelancer) throw new NotFoundError("Freelancer not found");
    return freelancer;
  },

  async approveRegistration(id: string, adminId: string) {
    const user = await adminRepository.approveRegistration(id);
    if (!user) throw new NotFoundError("User not found");
    await createAuditLog({
      userId: adminId,
      action: "STATUS_CHANGE",
      entityType: "User",
      entityId: id,
      metadata: { status: "ACTIVE", action: "approve_registration" },
    });
    return user;
  },

  async rejectRegistration(id: string, adminId: string, reason?: string) {
    const user = await adminRepository.rejectRegistration(id, reason);
    if (!user) throw new NotFoundError("User not found");
    await createAuditLog({
      userId: adminId,
      action: "STATUS_CHANGE",
      entityType: "User",
      entityId: id,
      metadata: { status: "INACTIVE", action: "reject_registration", reason },
    });
    return user;
  },

  async updateUserStatus(id: string, status: UserStatus, adminId: string) {
    if (status === "PENDING_APPROVAL" || status === "PENDING_VERIFICATION") {
      throw new ValidationError("Use approve/reject endpoints for registrations");
    }
    const user = await adminRepository.updateUserStatus(id, status);
    await createAuditLog({
      userId: adminId,
      action: "STATUS_CHANGE",
      entityType: "User",
      entityId: id,
      metadata: { status },
    });
    return user;
  },

  async updateStartupStatus(
    id: string,
    adminId: string,
    input: {
      status: StartupStatus;
      rejectionReason?: string;
    }
  ) {
    const existing = await adminRepository.getStartupDetail(id);
    if (!existing) throw new NotFoundError("Startup not found");

    const startup = await adminRepository.updateStartupStatus(id, {
      status: input.status,
      rejectionReason: input.rejectionReason,
      reviewedById: adminId,
    });

    await createAuditLog({
      userId: adminId,
      action: "STATUS_CHANGE",
      entityType: "Startup",
      entityId: id,
      metadata: { status: input.status },
    });

    return startup;
  },

  async setFreelancerVerified(
    id: string,
    isVerified: boolean,
    adminId: string
  ) {
    const existing = await adminRepository.getFreelancerDetail(id);
    if (!existing) throw new NotFoundError("Freelancer not found");
    const freelancer = await adminRepository.setFreelancerVerified(
      id,
      isVerified
    );
    await createAuditLog({
      userId: adminId,
      action: "STATUS_CHANGE",
      entityType: "Freelancer",
      entityId: id,
      metadata: { isVerified },
    });
    return freelancer;
  },

  async updateConsultationStatus(
    id: string,
    status: ConsultationStatus,
    notes: string | undefined,
    adminId: string
  ) {
    const consultation = await adminRepository.updateConsultationStatus(
      id,
      status,
      notes
    );
    await createAuditLog({
      userId: adminId,
      action: "STATUS_CHANGE",
      entityType: "Consultation",
      entityId: id,
      metadata: { status },
    });
    return consultation;
  },

  async updateAssignmentStatus(
    id: string,
    status: AssignmentStatus,
    adminId: string
  ) {
    const assignment = await adminRepository.updateAssignmentStatus(id, status);
    await createAuditLog({
      userId: adminId,
      action: "STATUS_CHANGE",
      entityType: "Assignment",
      entityId: id,
      metadata: { status },
    });
    return assignment;
  },

  reportsSummary() {
    return adminRepository.reportsSummary();
  },
};
