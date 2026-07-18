import "server-only";

import { ProductBlueprintSchema, type ProductBlueprint } from "@/lib/domain/blueprint/schemas";
import { toJson } from "@/lib/discovery/persistence";
import { createClient } from "@/lib/supabase/server";

export async function persistBlueprint(projectId: string, userId: string, blueprintInput: ProductBlueprint) {
  const blueprint = ProductBlueprintSchema.parse(blueprintInput);
  const supabase = await createClient();
  const { data, error } = await supabase.from("projects").update({ plan: toJson(blueprint), plan_schema_version: blueprint.schemaVersion, generation_source: blueprint.generationSource, blueprint_version: blueprint.version, status: "planned" }).eq("id", projectId).eq("user_id", userId).select("*").maybeSingle();
  if (error) throw error;
  return data;
}
