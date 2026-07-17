export class ProjectOwnershipError extends Error {
  constructor() {
    super("Project does not belong to the authenticated user.");
    this.name = "ProjectOwnershipError";
  }
}

export function assertProjectOwnership(
  project: { user_id: string },
  authenticatedUserId: string,
): void {
  if (project.user_id !== authenticatedUserId) {
    throw new ProjectOwnershipError();
  }
}
