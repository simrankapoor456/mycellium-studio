"use client";

import { useState } from "react";

import { SourceMaterialInfo } from "@/components/projects/SourceMaterialInfo";
import { FormField } from "@/components/ui/FormField";
import { ProjectTypeSchema } from "@/lib/domain/plan/schemas";
import { PRODUCT_TYPE_OPTIONS } from "@/lib/domain/project/labels";
import type { Project } from "@/lib/domain/project/schemas";

type Props = Readonly<{ project?: Project | undefined; fieldErrors?: Record<string, string[]> | undefined }>;

export function ProjectBasicsFields({ project, fieldErrors }: Props) {
  const description = project?.description ?? "";
  const [descriptionLength, setDescriptionLength] = useState(description.length);
  const [projectType, setProjectType] = useState(project?.project_type ?? "web-app");
  const legacyType = project?.project_type ? !PRODUCT_TYPE_OPTIONS.some((option) => option.value === project.project_type) : false;

  function selectProjectType(value: string) {
    const parsed = ProjectTypeSchema.safeParse(value);
    if (parsed.success) setProjectType(parsed.data);
  }

  return <>
    {project ? <input name="projectId" type="hidden" value={project.id} /> : <FormField className="sm:col-span-2" error={fieldErrors?.name?.[0]} htmlFor="project-name" label="Project name"><input aria-describedby="project-name-description" className="form-control mt-2" id="project-name" maxLength={120} name="name" required /></FormField>}
    <FormField className="sm:col-span-2" error={fieldErrors?.description?.[0]} hint="Paste the messy version — messages, meeting notes, emails, feedback, copied document text, rough ideas, requirements, contradictions, or anything else Mycel Core should understand." htmlFor="project-description" label="Add everything you already have" labelAction={<SourceMaterialInfo />}>
      <textarea aria-describedby="project-description-description project-description-count" className="form-control project-source-field mt-2 resize-y" defaultValue={description} id="project-description" maxLength={20_000} name="description" onChange={(event) => setDescriptionLength(event.currentTarget.value.length)} placeholder="Paste notes and rough context here. Line breaks and conflicting thoughts are welcome." />
      <div className="project-source-guidance" id="project-description-count"><span>Formatting is optional.</span><span>{descriptionLength.toLocaleString()} / 20,000 characters</span></div>
    </FormField>
    <FormField error={fieldErrors?.projectType?.[0]} htmlFor="project-type" label="Product type"><select className="form-control mt-2" id="project-type" name="projectType" onChange={(event) => selectProjectType(event.currentTarget.value)} value={projectType}>{PRODUCT_TYPE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}{legacyType && project?.project_type ? <option value={project.project_type}>{project.project_type.replaceAll("-", " ")}</option> : null}</select></FormField>
    {projectType === "custom" ? <FormField error={fieldErrors?.customProjectType?.[0]} htmlFor="custom-project-type" label="Describe the product type"><input className="form-control mt-2" defaultValue={project?.custom_project_type ?? ""} id="custom-project-type" maxLength={120} name="customProjectType" required /></FormField> : <input name="customProjectType" type="hidden" value="" />}
    <FormField className="sm:col-span-2" htmlFor="project-users" label="Target users"><textarea className="form-control mt-2 min-h-24 resize-y" defaultValue={project?.target_users ?? ""} id="project-users" maxLength={1_000} name="targetUsers" /></FormField>
  </>;
}
