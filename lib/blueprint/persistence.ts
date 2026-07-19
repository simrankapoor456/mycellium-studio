import "server-only";

import { ProductBlueprintSchema, type ProductBlueprint } from "@/lib/domain/blueprint/schemas";
import { toJson } from "@/lib/discovery/persistence";
import { createClient } from "@/lib/supabase/server";

export async function persistBlueprint(
  projectId: string,
  userId: string,
  blueprintInput: ProductBlueprint,
  generationRequestId?: string,
) {
  const blueprint = ProductBlueprintSchema.parse(blueprintInput);
  const supabase = await createClient();
  const requestUpdate = generationRequestId ? { last_generation_request_id: generationRequestId } : {};
  const { data, error } = await supabase.from("projects").update({ ...requestUpdate, plan: toJson(blueprint), plan_schema_version: blueprint.schemaVersion, generation_source: blueprint.generationSource, blueprint_version: blueprint.version, pressure_test: null, pressure_tested_at: null, pressure_test_blueprint_version: null, status: "planned" }).eq("id", projectId).eq("user_id", userId).select("*").maybeSingle();
  if (error) throw error;
  return data;
}
