export function projectInputFromFormData(formData: FormData) {
  return {
    name: formData.get("name"),
    description: formData.get("description"),
    projectType: formData.get("projectType"),
    customProjectType: formData.get("customProjectType"),
    targetUsers: formData.get("targetUsers"),
    teamSize: formData.get("teamSize"),
    sprintLength: formData.get("sprintLength"),
    capacity: formData.get("capacity"),
    planningDepth: formData.get("planningDepth"),
    constraints: formData.get("constraints"),
  };
}
