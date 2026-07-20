"use client";

import { SelectField, TextareaField, TextField } from "@/components/forms/FormControls";
import { SourceMaterialInfo } from "@/components/projects/SourceMaterialInfo";
import { PRODUCT_TYPE_OPTIONS } from "@/lib/domain/project/labels";
import type { ProjectFormValues } from "@/lib/domain/project/form-values";

type Props = Readonly<{
  editing: boolean;
  fieldErrors?: Record<string, string[]>;
  onChange: (name: keyof ProjectFormValues, value: string) => void;
  values: ProjectFormValues;
}>;

export function ProjectBasicsFields({ editing, fieldErrors, onChange, values }: Props) {
  const legacyType = values.projectType !== "" && !PRODUCT_TYPE_OPTIONS.some((option) => option.value === values.projectType);

  return <>
    {!editing ? <TextField error={fieldErrors?.name?.[0]} id="project-name" label="Project name" maxLength={120} name="name" onChange={(event) => onChange("name", event.currentTarget.value)} requirement="required" value={values.name} /> : null}
    <div className="project-description-field">
      <TextareaField
        error={fieldErrors?.description?.[0]}
        hint="Paste the messy version. Notes, feedback, requirements, and contradictions are all useful."
        id="project-description"
        label="Project description"
        labelAction={<SourceMaterialInfo />}
        maxLength={20_000}
        name="description"
        onChange={(event) => onChange("description", event.currentTarget.value)}
        placeholder="What are you trying to make, who is it for, and what is already known?"
        requirement="required"
        rows={10}
        value={values.description}
      />
      <div className="project-source-guidance" id="project-description-count"><span>Formatting is optional.</span><span>{values.description.length.toLocaleString()} / 20,000 characters</span></div>
    </div>
    <SelectField error={fieldErrors?.projectType?.[0]} id="project-type" label="Product type" name="projectType" onChange={(event) => onChange("projectType", event.currentTarget.value)} requirement="optional" value={values.projectType}>
      <option value="">Let discovery infer this</option>
      {PRODUCT_TYPE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      {legacyType ? <option value={values.projectType}>{values.projectType.replaceAll("-", " ")}</option> : null}
    </SelectField>
    {values.projectType === "custom" ? <TextField error={fieldErrors?.customProjectType?.[0]} id="custom-project-type" label="Describe the product type" maxLength={120} name="customProjectType" onChange={(event) => onChange("customProjectType", event.currentTarget.value)} requirement="optional" value={values.customProjectType} /> : <input name="customProjectType" type="hidden" value="" />}
  </>;
}
