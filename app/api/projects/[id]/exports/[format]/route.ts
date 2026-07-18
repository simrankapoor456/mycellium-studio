import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/current-user";
import { blueprintToCsv, blueprintToJson, blueprintToMarkdown } from "@/lib/blueprint/exports";
import { ProductBlueprintSchema } from "@/lib/domain/blueprint/schemas";
import { getProjectById } from "@/lib/projects/operations";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string; format: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
  const { id, format } = await params;
  const project = await getProjectById(id, user.id);
  if (!project) return NextResponse.json({ error: "Project not found." }, { status: 404 });
  if (!project.plan) return NextResponse.json({ error: "Exports become available after your first Product Blueprint is created." }, { status: 409 });
  const blueprint = ProductBlueprintSchema.parse(project.plan);
  const serializers = { markdown: { content: blueprintToMarkdown(blueprint), type: "text/markdown;charset=utf-8", extension: "md" }, json: { content: blueprintToJson(blueprint), type: "application/json;charset=utf-8", extension: "json" }, csv: { content: blueprintToCsv(blueprint), type: "text/csv;charset=utf-8", extension: "csv" } } as const;
  const selected = serializers[format as keyof typeof serializers];
  if (!selected) return NextResponse.json({ error: "That export format is not available." }, { status: 404 });
  const slug = project.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "mycellium-blueprint";
  return new Response(selected.content, { headers: { "Content-Type": selected.type, "Content-Disposition": `attachment; filename="${slug}-blueprint.${selected.extension}"`, "Cache-Control": "private, no-store" } });
}
