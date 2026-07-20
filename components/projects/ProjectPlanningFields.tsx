import { SelectField, TextareaField, TextField } from "@/components/forms/FormControls";
import type { ProjectFormValues } from "@/lib/domain/project/form-values";

export function ProjectPlanningFields({
  fieldErrors,
  onChange,
  values,
}: Readonly<{
  fieldErrors?: Record<string, string[]>;
  onChange: (name: keyof ProjectFormValues, value: string) => void;
  values: ProjectFormValues;
}>) {
  const hasAdvancedValues = Boolean(values.targetUsers || values.capacity || values.planningDepth || values.constraints);
  return (
    <>
      <SelectField error={fieldErrors?.sprintLength?.[0]} id="sprint-length" label="Sprint duration" name="sprintLength" onChange={(event) => onChange("sprintLength", event.currentTarget.value)} requirement="required" value={values.sprintLength}>
        <option value="">Choose a duration</option>
        <option value="1-week">1 week</option>
        <option value="2-weeks">2 weeks</option>
        <option value="3-weeks">3 weeks</option>
        <option value="4-weeks">4 weeks</option>
      </SelectField>
      <TextField error={fieldErrors?.teamSize?.[0]} id="team-size" label="Team size" max={50} min={1} name="teamSize" onChange={(event) => onChange("teamSize", event.currentTarget.value)} requirement="required" type="number" value={values.teamSize} />
      <details className="project-advanced-fields" open={hasAdvancedValues ? true : undefined}>
        <summary>Advanced planning <span>Optional context for estimation</span></summary>
        <div className="project-advanced-fields__content">
          <TextareaField id="project-users" label="Target users" maxLength={1_000} name="targetUsers" onChange={(event) => onChange("targetUsers", event.currentTarget.value)} requirement="optional" rows={4} value={values.targetUsers} />
          <SelectField id="planning-depth" label="Planning depth" name="planningDepth" onChange={(event) => onChange("planningDepth", event.currentTarget.value)} requirement="optional" value={values.planningDepth}>
            <option value="">Let discovery infer this</option>
            <option value="lean">Lean</option>
            <option value="balanced">Balanced</option>
            <option value="detailed">Detailed</option>
          </SelectField>
          <TextField error={fieldErrors?.capacity?.[0]} hint="The estimated work points the team can complete in one sprint." id="sprint-capacity" label="Estimated sprint capacity" max={200} min={1} name="capacity" onChange={(event) => onChange("capacity", event.currentTarget.value)} requirement="optional" type="number" value={values.capacity} />
          <TextareaField hint="Delivery, policy, technology, or timing boundaries." id="project-constraints" label="Constraints" maxLength={5_000} name="constraints" onChange={(event) => onChange("constraints", event.currentTarget.value)} requirement="optional" rows={4} value={values.constraints} />
        </div>
      </details>
    </>
  );
}
