import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

import bcrypt from "bcryptjs";

import {
  AuthProvider,
  OrganizationRole,
  OrganizationStatus,
  PaymentStatus,
  ProjectStatus,
  SprintStatus,
  SubTaskPriority,
  SubTaskStatus,
  SystemRole,
  TaskPriority,
  TaskStatus,
  UserStatus,
} from "../../../prisma/generated/prisma/enums";
import { PrismaClient } from "../../../prisma/generated/prisma/client";
import { prisma } from "../lib/prisma";

async function main() {
  console.log("🌱 Starting Taskora seed...");

  const hashedPassword = await bcrypt.hash("Taskora@123", 10);

  // =========================================================
  // 1. USERS
  // =========================================================

  const admin = await prisma.user.upsert({
    where: {
      email: "admin@taskora.com",
    },
    update: {
      name: "Taskora Admin",
      systemRole: SystemRole.ADMIN,
      status: UserStatus.ACTIVE,
      authProvider: AuthProvider.CREDENTIAL,
      emailVerified: true,
      password: hashedPassword,
    },
    create: {
      name: "Taskora Admin",
      email: "admin@taskora.com",
      password: hashedPassword,
      systemRole: SystemRole.ADMIN,
      status: UserStatus.ACTIVE,
      authProvider: AuthProvider.CREDENTIAL,
      emailVerified: true,
    },
  });

  const owner = await prisma.user.upsert({
    where: {
      email: "owner@taskora.com",
    },
    update: {
      name: "Taskora Owner",
      status: UserStatus.ACTIVE,
      authProvider: AuthProvider.CREDENTIAL,
      emailVerified: true,
      password: hashedPassword,
    },
    create: {
      name: "Taskora Owner",
      email: "owner@taskora.com",
      password: hashedPassword,
      systemRole: SystemRole.USER,
      status: UserStatus.ACTIVE,
      authProvider: AuthProvider.CREDENTIAL,
      emailVerified: true,
    },
  });

  const manager = await prisma.user.upsert({
    where: {
      email: "manager@taskora.com",
    },
    update: {
      name: "Taskora Manager",
      password: hashedPassword,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    },
    create: {
      name: "Taskora Manager",
      email: "manager@taskora.com",
      password: hashedPassword,
      systemRole: SystemRole.USER,
      status: UserStatus.ACTIVE,
      authProvider: AuthProvider.CREDENTIAL,
      emailVerified: true,
    },
  });

  const member = await prisma.user.upsert({
    where: {
      email: "member@taskora.com",
    },
    update: {
      name: "Taskora Team Member",
      password: hashedPassword,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    },
    create: {
      name: "Taskora Team Member",
      email: "member@taskora.com",
      password: hashedPassword,
      systemRole: SystemRole.USER,
      status: UserStatus.ACTIVE,
      authProvider: AuthProvider.CREDENTIAL,
      emailVerified: true,
    },
  });

  const client = await prisma.user.upsert({
    where: {
      email: "client@taskora.com",
    },
    update: {
      name: "Taskora Client",
      password: hashedPassword,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    },
    create: {
      name: "Taskora Client",
      email: "client@taskora.com",
      password: hashedPassword,
      systemRole: SystemRole.USER,
      status: UserStatus.ACTIVE,
      authProvider: AuthProvider.CREDENTIAL,
      emailVerified: true,
    },
  });

  console.log("✅ Users created");

  // =========================================================
  // 2. PROFILES
  // =========================================================

  await prisma.profile.upsert({
    where: {
      userId: owner.id,
    },
    update: {
      jobTitle: "Project Owner",
      bio: "Taskora demo organization owner.",
      skills: ["Project Management", "Planning", "Leadership"],
      experience: "5 years",
      location: "Dhaka, Bangladesh",
      timezone: "Asia/Dhaka",
    },
    create: {
      userId: owner.id,
      jobTitle: "Project Owner",
      bio: "Taskora demo organization owner.",
      skills: ["Project Management", "Planning", "Leadership"],
      experience: "5 years",
      location: "Dhaka, Bangladesh",
      timezone: "Asia/Dhaka",
    },
  });

  await prisma.profile.upsert({
    where: {
      userId: manager.id,
    },
    update: {
      jobTitle: "Project Manager",
      bio: "Taskora demo project manager.",
      skills: ["Management", "Agile", "Scrum"],
      experience: "3 years",
      location: "Dhaka, Bangladesh",
      timezone: "Asia/Dhaka",
    },
    create: {
      userId: manager.id,
      jobTitle: "Project Manager",
      bio: "Taskora demo project manager.",
      skills: ["Management", "Agile", "Scrum"],
      experience: "3 years",
      location: "Dhaka, Bangladesh",
      timezone: "Asia/Dhaka",
    },
  });

  await prisma.profile.upsert({
    where: {
      userId: member.id,
    },
    update: {
      jobTitle: "Frontend Developer",
      bio: "Taskora demo team member.",
      skills: ["JavaScript", "React", "Next.js"],
      experience: "2 years",
      location: "Dhaka, Bangladesh",
      timezone: "Asia/Dhaka",
    },
    create: {
      userId: member.id,
      jobTitle: "Frontend Developer",
      bio: "Taskora demo team member.",
      skills: ["JavaScript", "React", "Next.js"],
      experience: "2 years",
      location: "Dhaka, Bangladesh",
      timezone: "Asia/Dhaka",
    },
  });

  // =========================================================
  // 3. ORGANIZATION
  // =========================================================

  let organization = await prisma.organization.findFirst({
    where: {
      name: "Taskora Technologies",
    },
  });

  if (!organization) {
    organization = await prisma.organization.create({
      data: {
        name: "Taskora Technologies",
        description:
          "Demo organization for Taskora project management platform.",
        industry: "Software Development",
        status: OrganizationStatus.APPROVED,
        createdById: owner.id,
      },
    });
  }

  // =========================================================
  // 4. ORGANIZATION MEMBERS
  // =========================================================

  const organizationMembers = [
    {
      userId: owner.id,
      role: OrganizationRole.OWNER,
    },
    {
      userId: manager.id,
      role: OrganizationRole.MANAGER,
    },
    {
      userId: member.id,
      role: OrganizationRole.TEAM_MEMBER,
    },
  ];

  for (const item of organizationMembers) {
    const existing = await prisma.organizationMember.findFirst({
      where: {
        organizationId: organization.id,
        userId: item.userId,
      },
    });

    if (!existing) {
      await prisma.organizationMember.create({
        data: {
          organizationId: organization.id,
          userId: item.userId,
          role: item.role,
        },
      });
    } else {
      await prisma.organizationMember.update({
        where: {
          id: existing.id,
        },
        data: {
          role: item.role,
        },
      });
    }
  }

  console.log("✅ Organization and members created");

  // =========================================================
  // 5. TEAMS
  // =========================================================

  let developmentTeam = await prisma.team.findFirst({
    where: {
      name: "Development Team",
      organizationId: organization.id,
    },
  });

  if (!developmentTeam) {
    developmentTeam = await prisma.team.create({
      data: {
        name: "Development Team",
        description: "Main software development team.",
        organizationId: organization.id,
        createdById: owner.id,
      },
    });
  }

  let designTeam = await prisma.team.findFirst({
    where: {
      name: "Design Team",
      organizationId: organization.id,
    },
  });

  if (!designTeam) {
    designTeam = await prisma.team.create({
      data: {
        name: "Design Team",
        description: "UI/UX and product design team.",
        organizationId: organization.id,
        createdById: manager.id,
      },
    });
  }

  // =========================================================
  // 6. TEAM MEMBERS
  // =========================================================

  const teamMemberships = [
    {
      teamId: developmentTeam.id,
      userId: owner.id,
    },
    {
      teamId: developmentTeam.id,
      userId: manager.id,
    },
    {
      teamId: developmentTeam.id,
      userId: member.id,
    },
    {
      teamId: designTeam.id,
      userId: manager.id,
    },
  ];

  for (const item of teamMemberships) {
    const existing = await prisma.teamMember.findFirst({
      where: {
        teamId: item.teamId,
        userId: item.userId,
      },
    });

    if (!existing) {
      await prisma.teamMember.create({
        data: item,
      });
    }
  }

  console.log("✅ Teams and team members created");

  // =========================================================
  // 7. PROJECT
  // =========================================================

  let project = await prisma.project.findFirst({
    where: {
      name: "Taskora Website Development",
      organizationId: organization.id,
    },
  });

  if (!project) {
    project = await prisma.project.create({
      data: {
        name: "Taskora Website Development",
        description: "Development of the Taskora project management platform.",
        organizationId: organization.id,
        createdById: owner.id,
        clientId: client.id,
        status: ProjectStatus.ACTIVE,
        startDate: new Date("2026-09-01"),
        dueDate: new Date("2026-10-15"),
      },
    });
  }

  // =========================================================
  // 8. PROJECT TEAMS
  // =========================================================

  const projectTeamData = [
    {
      projectId: project.id,
      teamId: developmentTeam.id,
    },
    {
      projectId: project.id,
      teamId: designTeam.id,
    },
  ];

  for (const item of projectTeamData) {
    const existing = await prisma.projectTeam.findFirst({
      where: {
        projectId: item.projectId,
        teamId: item.teamId,
      },
    });

    if (!existing) {
      await prisma.projectTeam.create({
        data: item,
      });
    }
  }

  // =========================================================
  // 9. SPRINT
  // =========================================================

  let sprint = await prisma.sprint.findFirst({
    where: {
      projectId: project.id,
      name: "Sprint 1 - Foundation",
    },
  });

  if (!sprint) {
    sprint = await prisma.sprint.create({
      data: {
        projectId: project.id,
        name: "Sprint 1 - Foundation",
        goal: "Complete the foundation and authentication modules.",
        startDate: new Date("2026-09-01"),
        endDate: new Date("2026-09-14"),
        status: SprintStatus.ACTIVE,
        paymentAmount: "500.00",
        createdById: owner.id,
      },
    });
  }

  // =========================================================
  // 10. SPRINT TEAM
  // =========================================================

  let sprintTeam = await prisma.sprintTeam.findFirst({
    where: {
      sprintId: sprint.id,
      teamId: developmentTeam.id,
    },
  });

  if (!sprintTeam) {
    sprintTeam = await prisma.sprintTeam.create({
      data: {
        sprintId: sprint.id,
        teamId: developmentTeam.id,
        createdById: owner.id,
      },
    });
  }

  // =========================================================
  // 11. TASKS
  // =========================================================

  let task1 = await prisma.task.findFirst({
    where: {
      projectId: project.id,
      sprintId: sprint.id,
      title: "Implement authentication system",
    },
  });

  if (!task1) {
    task1 = await prisma.task.create({
      data: {
        projectId: project.id,
        sprintId: sprint.id,
        sprintTeamId: sprintTeam.id,
        title: "Implement authentication system",
        description:
          "Implement email/password authentication and Google authentication.",
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        createdById: owner.id,
        dueDate: new Date("2026-09-08"),
      },
    });
  }

  let task2 = await prisma.task.findFirst({
    where: {
      projectId: project.id,
      sprintId: sprint.id,
      title: "Create project dashboard APIs",
    },
  });

  if (!task2) {
    task2 = await prisma.task.create({
      data: {
        projectId: project.id,
        sprintId: sprint.id,
        sprintTeamId: sprintTeam.id,
        title: "Create project dashboard APIs",
        description:
          "Build APIs for project dashboard statistics and project data.",
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        createdById: manager.id,
        dueDate: new Date("2026-09-12"),
      },
    });
  }

  // =========================================================
  // 12. SUBTASKS
  // =========================================================

  const existingSubTask1 = await prisma.subTask.findFirst({
    where: {
      taskId: task1.id,
      title: "Create email/password login",
    },
  });

  if (!existingSubTask1) {
    await prisma.subTask.create({
      data: {
        taskId: task1.id,
        title: "Create email/password login",
        description: "Implement credential based login.",
        status: SubTaskStatus.COMPLETED,
        priority: SubTaskPriority.HIGH,
        assignedToId: member.id,
        createdById: owner.id,
        dueDate: new Date("2026-09-04"),
      },
    });
  }

  const existingSubTask2 = await prisma.subTask.findFirst({
    where: {
      taskId: task1.id,
      title: "Implement Google login",
    },
  });

  if (!existingSubTask2) {
    await prisma.subTask.create({
      data: {
        taskId: task1.id,
        title: "Implement Google login",
        description: "Implement Google authentication using GCP.",
        status: SubTaskStatus.IN_PROGRESS,
        priority: SubTaskPriority.HIGH,
        assignedToId: member.id,
        createdById: owner.id,
        dueDate: new Date("2026-09-07"),
      },
    });
  }

  const existingSubTask3 = await prisma.subTask.findFirst({
    where: {
      taskId: task2.id,
      title: "Create dashboard statistics",
    },
  });

  if (!existingSubTask3) {
    await prisma.subTask.create({
      data: {
        taskId: task2.id,
        title: "Create dashboard statistics",
        description: "Return useful project statistics.",
        status: SubTaskStatus.TODO,
        priority: SubTaskPriority.MEDIUM,
        assignedToId: manager.id,
        createdById: manager.id,
      },
    });
  }

  // =========================================================
  // 13. COMMENTS
  // =========================================================

  const existingComment = await prisma.comment.findFirst({
    where: {
      taskId: task1.id,
      userId: manager.id,
      content: "Authentication implementation is progressing well.",
    },
  });

  if (!existingComment) {
    await prisma.comment.create({
      data: {
        taskId: task1.id,
        userId: manager.id,
        content: "Authentication implementation is progressing well.",
      },
    });
  }

  // =========================================================
  // 14. ATTACHMENT
  // =========================================================

  const existingAttachment = await prisma.attachment.findFirst({
    where: {
      taskId: task1.id,
      fileName: "authentication-requirements.pdf",
    },
  });

  if (!existingAttachment) {
    await prisma.attachment.create({
      data: {
        taskId: task1.id,
        userId: owner.id,
        fileName: "authentication-requirements.pdf",
        fileUrl: "https://example.com/files/authentication-requirements.pdf",
      },
    });
  }

  // =========================================================
  // 15. PAYMENT
  // =========================================================

  const existingPayment = await prisma.payment.findUnique({
    where: {
      sprintId: sprint.id,
    },
  });

  if (!existingPayment) {
    await prisma.payment.create({
      data: {
        sprintId: sprint.id,
        clientId: client.id,
        amount: "500.00",
        status: PaymentStatus.PENDING,
      },
    });
  }

  // =========================================================
  // DONE
  // =========================================================

  console.log("");
  console.log("🎉 Taskora seed completed successfully!");
  console.log("");
  console.log("Demo Accounts");
  console.log("--------------------------------");
  console.log("Admin   : admin@taskora.com");
  console.log("Owner   : owner@taskora.com");
  console.log("Manager : manager@taskora.com");
  console.log("Member  : member@taskora.com");
  console.log("Client  : client@taskora.com");
  console.log("");
  console.log("Password for all accounts: Taskora@123");
  console.log("--------------------------------");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
