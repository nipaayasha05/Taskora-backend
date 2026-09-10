import {
  SubTaskPriority,
  SubTaskStatus,
} from "../../../../prisma/generated/prisma/enums";

export interface ISubTaskCreate {
  title: string;
  description?: string;
  status?: SubTaskStatus;
  priority?: SubTaskPriority;
  assignedToId?: string;
  dueDate?: Date;
}
