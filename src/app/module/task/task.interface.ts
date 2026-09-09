import {
  TaskPriority,
  TaskStatus,
} from "../../../../prisma/generated/prisma/enums";

export interface ITaskCreate {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  sprintTeamId: string;
  dueDate?: string;
}

export interface ITaskUpdate {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  sprintTeamId?: string;
  dueDate?: string;
}
