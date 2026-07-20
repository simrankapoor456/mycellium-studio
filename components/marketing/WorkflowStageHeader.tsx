import { Badge } from "@/components/ui/Badge";

type WorkflowStageHeaderProps = {
  label: string;
  title: string;
  description: string;
  output: string;
};

export function WorkflowStageHeader({ label, title, description, output }: WorkflowStageHeaderProps) {
  return (
    <header className="workflow-stage__header">
      <div>
        <Badge tone="warning">{label}</Badge>
        <h3 className="display-type balanced-text mt-5 text-3xl leading-tight text-forest sm:text-4xl">{title}</h3>
        <p className="mt-4 max-w-[64ch] leading-7 text-ink/70">{description}</p>
      </div>
      <div className="workflow-stage__output">
        <span>Stage output</span>
        <strong>{output}</strong>
      </div>
    </header>
  );
}
