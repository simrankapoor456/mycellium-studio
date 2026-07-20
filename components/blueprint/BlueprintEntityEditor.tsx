"use client";

import { FormEvent, useState } from "react";

import type { BlueprintEditInput, BlueprintEntityType, ProductBlueprint } from "@/lib/domain/blueprint/schemas";

type Editable = ProductBlueprint["goals"][number] & { acceptanceCriteria?: string[]; sprintId?: string | null };

export function BlueprintEntityEditor({ projectId, type, entity, sprints, onSaved }: { projectId: string; type: BlueprintEntityType; entity: Editable; sprints: ProductBlueprint["sprintPlan"]; onSaved: (blueprint: ProductBlueprint) => void }) {
  const [error, setError] = useState(""); const [pending, setPending] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const data = new FormData(event.currentTarget);
    let requestFailure = "";
    const changes: BlueprintEditInput["changes"] = { title: String(data.get("title")), description: String(data.get("description")), status: String(data.get("status")) as Editable["status"], priority: String(data.get("priority")) as Editable["priority"], owner: String(data.get("owner") || "") || null, estimate: data.get("estimate") ? Number(data.get("estimate")) : null };
    if (entity.acceptanceCriteria) changes.acceptanceCriteria = String(data.get("acceptanceCriteria") || "").split("\n").map((item) => item.trim()).filter(Boolean);
    if ("sprintId" in entity) changes.sprintId = String(data.get("sprintId") || "") || null;
    try {
      const response = await fetch(`/api/projects/${projectId}/blueprint`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ entityType: type, entityId: entity.id, changes }) });
      const result = await response.json() as { blueprint?: ProductBlueprint; error?: string };
      if (response.status === 401) requestFailure = "Your session expired. Sign in again, then retry. Your changes are still here.";
      else if (response.status === 403) requestFailure = "You do not have permission to change this blueprint.";
      else if (!response.ok || !result.blueprint) requestFailure = result.error || "The change could not be saved. Your edits are still here. Retry.";
      if (requestFailure || !result.blueprint) throw new Error("Handled blueprint failure");
      onSaved(result.blueprint);
    } catch (caught) {
      setError(caught instanceof TypeError ? "Could not reach the server. Your edits are still here. Check your connection and retry." : requestFailure || "The change could not be saved. Your edits are still here. Retry.");
    } finally {
      setPending(false);
    }
  }
  return <details className="blueprint-editor"><summary>Edit</summary><form onSubmit={submit}><label>Title<input defaultValue={entity.title} name="title" required /></label><label>Description<textarea defaultValue={entity.description} name="description" required rows={3} /></label><div className="blueprint-editor__grid"><label>Status<select defaultValue={entity.status} name="status"><option value="draft">Draft</option><option value="needs_review">Needs review</option><option value="approved">Approved</option><option value="in_progress">In progress</option><option value="done">Done</option></select></label><label>Priority<select defaultValue={entity.priority} name="priority"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label><label>Owner<input defaultValue={entity.owner ?? ""} name="owner" /></label><label>Estimate<input defaultValue={entity.estimate ?? ""} min="0" max="100" name="estimate" type="number" /></label></div>{entity.acceptanceCriteria ? <label>Acceptance criteria<textarea defaultValue={entity.acceptanceCriteria.join("\n")} name="acceptanceCriteria" rows={4} /></label> : null}{"sprintId" in entity ? <label>Sprint assignment<select defaultValue={entity.sprintId ?? ""} name="sprintId"><option value="">Unassigned</option>{sprints.map((sprint) => <option key={sprint.id} value={sprint.id}>{sprint.title}</option>)}</select></label> : null}{error ? <p role="alert">{error}</p> : null}<button disabled={pending} type="submit">{pending ? "Saving" : "Save changes"}</button></form></details>;
}
