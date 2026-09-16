export interface ITeamCreate {
  name: string;
  description?: string;
}

export interface ITeamUpdate {
  name?: string;
  description?: string;
}

export interface ITeamMemberCreate {
  userIds: string[];
}
