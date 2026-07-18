import { FormField } from "@/components/ui/FormField";
import type { Project } from "@/lib/domain/project/schemas";

export function ProjectPlanningFields({
  project,
  fieldErrors,
}: Readonly<{
  project?: Project | undefined;
  fieldErrors?: Record<string, string[]> | undefined;
}>) {
  return (
    <>
      <FormField htmlFor="planning-depth" label="Planning depth">
        <select className="form-control mt-2" defaultValue={project?.planning_depth ?? "balanced"} id="planning-depth" name="planningDepth">
          <option value="lean">Lean</option>
          <option value="balanced">Balanced</option>
          <option value="detailed">Detailed</option>
        </select>
      </FormField>
      <FormField error={fieldErrors?.teamSize?.[0]} htmlFor="team-size" label="Team size">
        <input aria-describedby="team-size-description" className="form-control mt-2" defaultValue={project?.team_size ?? 3} id="team-size" max={50} min={1} name="teamSize" required type="number" />
      </FormField>
      <FormField htmlFor="sprint-length" label="Sprint duration">
        <select className="form-control mt-2" defaultValue={project?.sprint_length ?? "2-weeks"} id="sprint-length" name="sprintLength">
          <option value="1-week">1 week</option>
          <option value="2-weeks">2 weeks</option>
          <option value="3-weeks">3 weeks</option>
          <option value="4-weeks">4 weeks</option>
        </select>
      </FormField>
      <FormField error={fieldErrors?.capacity?.[0]} htmlFor="team-capacity" label="Team capacity">
        <input aria-describedby="team-capacity-description" className="form-control mt-2" defaultValue={project?.capacity ?? 24} id="team-capacity" max={200} min={1} name="capacity" required type="number" />
      </FormField>
      <FormField className="sm:col-span-2" hint="Optional delivery, policy, technology, or timing boundaries." htmlFor="project-constraints" label="Constraints">
        <textarea aria-describedby="project-constraints-description" className="form-control mt-2 min-h-28 resize-y" defaultValue={project?.constraints ?? ""} id="project-constraints" maxLength={5000} name="constraints" />
      </FormField>
    </>
  );
}
