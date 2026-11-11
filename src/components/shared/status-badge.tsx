import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const TONE: Record<string, string> = {
  active: "bg-success/15 text-success", open: "bg-success/15 text-success", tp_hit: "bg-success/15 text-success",
  pending: "bg-amber-500/15 text-amber-400", rejected: "bg-destructive/15 text-destructive", sl_hit: "bg-destructive/15 text-destructive",
  expired: "bg-muted text-muted-foreground", closed: "bg-muted text-muted-foreground",
};
export const StatusBadge = ({ status }: { status: string }) => <Badge className={cn("uppercase", TONE[status])}>{status.replace("_", " ")}</Badge>;
