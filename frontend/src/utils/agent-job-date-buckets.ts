export type AgentJobDateBucketJob = {
  foundAt?: string;
  jobPostedAt?: string;
};

export type AgentJobsByDate<TJob extends AgentJobDateBucketJob> = {
  today: TJob[];
  yesterday: TJob[];
  lastWeek: TJob[];
  older: TJob[];
};

export const emptyAgentJobsByDate = <
  TJob extends AgentJobDateBucketJob,
>(): AgentJobsByDate<TJob> => ({
  today: [],
  yesterday: [],
  lastWeek: [],
  older: [],
});

export const buildAgentJobsByDate = <TJob extends AgentJobDateBucketJob>(
  jobs: TJob[] = [],
  now = new Date(),
): AgentJobsByDate<TJob> => {
  const byDate = emptyAgentJobsByDate<TJob>();

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  jobs.forEach((job) => {
    const sourceDate = new Date(job.foundAt || job.jobPostedAt || 0);
    const timestamp = sourceDate.getTime();

    if (!Number.isFinite(timestamp)) {
      byDate.older.push(job);
      return;
    }

    if (timestamp >= today.getTime()) {
      byDate.today.push(job);
      return;
    }

    if (timestamp >= yesterday.getTime()) {
      byDate.yesterday.push(job);
      return;
    }

    if (timestamp >= lastWeek.getTime()) {
      byDate.lastWeek.push(job);
      return;
    }

    byDate.older.push(job);
  });

  return byDate;
};
