import { prisma } from "../../lib/prisma";
import { RequestUser } from "../../middleware/checkAuth";

const getUserOverview = async (user: RequestUser) => {
  const [
    organizations,
    createdOrganizations,
    projects,
    teams,
    sprints,
    payments,
    invitations,
  ] = await Promise.all([
    prisma.organizationMember.findMany({
      where: {
        userId: user.userId,
      },
      include: {
        organization: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.organization.findMany({
      where: {
        createdById: user.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.project.findMany({
      where: {
        OR: [
          {
            createdById: user.userId,
          },
          {
            clientId: user.userId,
          },
        ],
      },
      include: {
        organization: true,
        sprints: true,
      },
    }),

    prisma.team.findMany({
      where: {
        members: {
          some: {
            userId: user.userId,
          },
        },
      },
      include: {
        organization: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    // prisma.team.findMany({
    //   where: {
    //     members: {
    //       some: {
    //         userId: user.userId,
    //       },
    //     },
    //   },
    //   include: {
    //     organization: true,
    //   },
    //   orderBy: {
    //     createdAt: "desc",
    //   },
    // }),
    prisma.sprint.findMany({
      where: {
        createdById: user.userId,
      },
      include: {
        project: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.payment.findMany({
      where: {
        clientId: user.userId,
      },
      include: {
        sprint: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.organizationJoinRequest.findMany({
      where: {
        invitedToId: user.userId,
      },
      include: {
        organization: true,
        invitedBy: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);
  return {
    user: {
      id: user.userId,
    },
    organizations,
    createdOrganizations,
    projects,
    teams,
    sprints,
    payments,
    invitations,
  };
};

const getAdminView = async () => {
  const [
    users,
    organizations,
    projects,
    teams,
    sprints,
    payments,
    recentUsers,
    recentOrganizations,
    recentPayments,
  ] = await Promise.all([
    prisma.user.count(),

    prisma.organization.count(),

    prisma.project.count(),

    prisma.team.count(),

    prisma.sprint.count(),

    prisma.payment.count(),

    prisma.organization.findMany({
      where: {
        status: "PENDING",
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    }),

    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        systemRole: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    }),

    prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        industry: true,
        status: true,
        createdAt: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),

    prisma.payment.findMany({
      select: {
        id: true,
        amount: true,
        status: true,
        transactionId: true,
        paidAt: true,
        createdAt: true,
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        sprint: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    }),
  ]);

  const [
    activeUsers,
    inactiveUsers,
    bannedUsers,

    pendingOrganizationsCount,

    approvedOrganizations,
    rejectedOrganizations,

    activeProjects,
    completedProjects,
    onHoldProjects,
    cancelledProjects,

    plannedSprints,
    activeSprints,
    completedSprints,
    cancelledSprints,

    pendingPayments,
    successfulPayments,
    failedPayments,
  ] = await Promise.all([
    prisma.user.count({
      where: {
        status: "ACTIVE",
      },
    }),

    prisma.user.count({
      where: {
        status: "INACTIVE",
      },
    }),

    prisma.user.count({
      where: {
        status: "BANNED",
      },
    }),

    prisma.organization.count({
      where: {
        status: "PENDING",
      },
    }),

    prisma.organization.count({
      where: {
        status: "APPROVED",
      },
    }),

    prisma.organization.count({
      where: {
        status: "REJECTED",
      },
    }),

    prisma.project.count({
      where: {
        status: "ACTIVE",
      },
    }),

    prisma.project.count({
      where: {
        status: "COMPLETED",
      },
    }),

    prisma.project.count({
      where: {
        status: "ON_HOLD",
      },
    }),

    prisma.project.count({
      where: {
        status: "CANCELLED",
      },
    }),

    prisma.sprint.count({
      where: {
        status: "PLANNED",
      },
    }),

    prisma.sprint.count({
      where: {
        status: "ACTIVE",
      },
    }),

    prisma.sprint.count({
      where: {
        status: "COMPLETED",
      },
    }),

    prisma.sprint.count({
      where: {
        status: "CANCELLED",
      },
    }),

    prisma.payment.count({
      where: {
        status: "PENDING",
      },
    }),

    prisma.payment.count({
      where: {
        status: "SUCCESS",
      },
    }),

    prisma.payment.count({
      where: {
        status: "FAILED",
      },
    }),
  ]);
  return {
    statistics: {
      users: {
        total: users,
        active: activeUsers,
        inactive: inactiveUsers,
        banned: bannedUsers,
      },
      organizations: {
        total: organizations,
        pending: pendingOrganizationsCount,
        approved: approvedOrganizations,
        rejected: rejectedOrganizations,
      },
      projects: {
        total: projects,
        active: activeProjects,
        completed: completedProjects,
        onHold: onHoldProjects,
        cancelled: cancelledProjects,
      },
      teams: {
        total: teams,
      },
      sprints: {
        total: sprints,
        planned: plannedSprints,
        active: activeSprints,
        completed: completedSprints,
        cancelled: cancelledSprints,
      },
      payments: {
        total: payments,
        pending: pendingPayments,
        successful: successfulPayments,
        failed: failedPayments,
      },
    },
    pendingOrganizationsCount,
    recentUsers,
    recentOrganizations,
    recentPayments,
  };
};

export const userService = {
  getUserOverview,
  getAdminView,
};
