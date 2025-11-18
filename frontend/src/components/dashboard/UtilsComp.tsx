// src/components/dashboard/UtilsComp.tsx (only the UsageTracker excerpt shown)
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';

export function UsageTracker({
  label,
  used = 0,
  limit = 0,
}: {
  label: string;
  used?: number;
  limit?: number | -1;
}) {
  const isUnlimited = limit === -1;
  const usedNum = Number(used || 0);
  const limitNum = isUnlimited ? 0 : Number(limit || 0);
  const percentage =
    limitNum > 0 ? Math.min(100, Math.round((usedNum / limitNum) * 100)) : 0;

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-baseline">
        <Label className="text-sm">{label}</Label>
        <p className="text-sm text-muted-foreground">
          {isUnlimited ? 'Unlimited' : `${usedNum} / ${limitNum}`}
        </p>
      </div>
      {!isUnlimited && <Progress value={percentage} />}
    </div>
  );
}
