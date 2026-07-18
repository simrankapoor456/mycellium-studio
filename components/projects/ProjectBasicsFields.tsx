import { FormField } from "@/components/ui/FormField";
import type { Project } from "@/lib/domain/project/schemas";

export function ProjectBasicsFields({
  project,
  fieldErrors,
}: Readonly<{
  project?: Project | undefined;
  fieldErrors?: Record<string, string[]> | undefined;
}>) {
  return (
    <>
      {project ? <input name="projectId" type="hidden" value={project.id} /> : (
        <FormField className="sm:col-span-2" error={fieldErrors?.name?.[0]} htmlFor="project-name" label="Project name">
          <input aria-describedby="project-name-description" className="form-control mt-2" id="project-name" maxLength={120} name="name" required />
        </FormField>
      )}
      <FormField className="sm:col-span-2" htmlFor="project-description" label="Project description">
        <textarea className="form-control mt-2 min-h-28 resize-y" defaultValue={project?.description ?? ""} id="project-description" maxLength={2000} name="description" />
      </FormField>
      <FormField htmlFor="project-type" label="Product type">
        <select className="form-control mt-2" defaultValue={project?.project_type ?? "web-app"} id="project-type" name="projectType">
          <option value="web-app">Web app</option>
          <option value="mobile-app">Mobile app</option>
          <option value="internal-tool">Internal tool</option>
          <option value="ai-product">AI product</option>
          <option value="data-pipeline">Data pipeline</option>
          <option value="other">Other</option>
        </select>
      </FormField>
      <FormField className="sm:col-span-2" htmlFor="project-users" label="Target users">
        <textarea className="form-control mt-2 min-h-24 resize-y" defaultValue={project?.target_users ?? ""} id="project-users" maxLength={1000} name="targetUsers" />
      </FormField>
    </>
  );
}
