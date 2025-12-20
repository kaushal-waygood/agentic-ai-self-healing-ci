export function makeTop4Key(userId, bucket) {
  return `jobs:dashboard:top4:v1:${userId}:${bucket}`;
}
