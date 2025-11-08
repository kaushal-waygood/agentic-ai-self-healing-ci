// src/utils/workerSupervisor.js
import { fork } from 'child_process';
import path from 'path';
import mongoose from 'mongoose';

const WORKER_PATH = path.resolve('./worker.js');
const LEADER_LOCK_ID = 'autopilot_worker_leader';
const LEADER_TTL_SECONDS = 30;

let workerProcess = null;
let isLeader = false;
let leaderRenewInterval = null;
let agentStream = null;
let pollingInterval = null;

// --- Leader lock via MongoDB ---
async function tryAcquireLeader() {
  try {
    const db = mongoose.connection.db;
    const locks = db.collection('process_locks');
    await locks
      .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
      .catch(() => {});
    const now = new Date();
    const expiresAt = new Date(now.getTime() + LEADER_TTL_SECONDS * 1000);

    const res = await locks.findOneAndUpdate(
      {
        _id: LEADER_LOCK_ID,
        $or: [{ expiresAt: { $lte: now } }, { expiresAt: { $exists: false } }],
      },
      { $set: { _id: LEADER_LOCK_ID, owner: process.pid, expiresAt } },
      { upsert: true, returnDocument: 'after' },
    );

    if (res.value && res.value.owner === process.pid) {
      isLeader = true;
      return true;
    }
    return false;
  } catch (err) {
    console.warn('[Leader] Lock acquire failed:', err?.message || err);
    return false;
  }
}

async function renewLeader() {
  try {
    const db = mongoose.connection.db;
    const locks = db.collection('process_locks');
    const now = new Date();
    const expiresAt = new Date(now.getTime() + LEADER_TTL_SECONDS * 1000);

    const res = await locks.findOneAndUpdate(
      { _id: LEADER_LOCK_ID, owner: process.pid },
      { $set: { expiresAt } },
      { returnDocument: 'after' },
    );

    if (!res.value) {
      console.warn('[Leader] Lost leadership.');
      await stopWorker();
      isLeader = false;
    }
  } catch (err) {
    console.warn('[Leader] Renew failed:', err?.message || err);
  }
}

async function releaseLeader() {
  try {
    const db = mongoose.connection.db;
    const locks = db.collection('process_locks');
    await locks.deleteOne({ _id: LEADER_LOCK_ID, owner: process.pid });
  } catch (err) {
    console.warn('[Leader] release failed:', err?.message || err);
  }
}

// --- Worker process management ---
function startWorker() {
  if (workerProcess) return;
  console.log('[WorkerSupervisor] Starting worker.js...');
  workerProcess = fork(WORKER_PATH, [], {
    env: { ...process.env, WORKER_PARENT_PID: process.pid },
    stdio: ['ignore', 'inherit', 'inherit', 'ipc'],
  });

  workerProcess.on('exit', (code, signal) => {
    console.warn(
      `[WorkerSupervisor] worker.js exited (code=${code}, signal=${signal}).`,
    );
    workerProcess = null;
    if (!isLeader) return;
    console.log('[WorkerSupervisor] Restarting worker in 1s...');
    setTimeout(() => {
      if (isLeader) startWorker();
    }, 1000);
  });
}

function stopWorker() {
  if (!workerProcess) return;
  console.log('[WorkerSupervisor] Stopping worker...');
  try {
    workerProcess.send({ type: 'shutdown' });
    setTimeout(() => {
      if (workerProcess) {
        try {
          workerProcess.kill('SIGTERM');
        } catch {}
        workerProcess = null;
      }
    }, 2000);
  } catch {
    try {
      workerProcess.kill('SIGTERM');
    } catch {}
    workerProcess = null;
  }
}

// --- Agent detection ---
async function checkAgentsCount() {
  try {
    const db = mongoose.connection.db;
    const students = db.collection('students');
    const one = await students.findOne(
      { 'autopilotAgent.0': { $exists: true } },
      { projection: { _id: 1 } },
    );
    return !!one;
  } catch (err) {
    console.warn('[AgentCheck] failed:', err?.message || err);
    return false;
  }
}

async function setupAgentWatcher() {
  try {
    const db = mongoose.connection.db;
    const students = db.collection('students');
    agentStream = students.watch(
      [
        {
          $match: {
            $or: [
              {
                'updateDescription.updatedFields.autopilotAgent': {
                  $exists: true,
                },
              },
              { 'fullDocument.autopilotAgent': { $exists: true } },
              { operationType: 'insert' },
              { operationType: 'update' },
              { operationType: 'replace' },
              { operationType: 'delete' },
            ],
          },
        },
      ],
      { fullDocument: 'updateLookup' },
    );

    agentStream.on('change', async () => {
      const hasAgents = await checkAgentsCount();
      if (hasAgents && isLeader) startWorker();
      if (!hasAgents && workerProcess) stopWorker();
    });

    agentStream.on('error', (err) => {
      console.warn(
        '[AgentWatcher] Stream error, fallback to polling:',
        err?.message || err,
      );
      try {
        agentStream.close();
      } catch {}
      agentStream = null;
      startAgentPolling();
    });

    console.log('[AgentWatcher] change stream started.');
  } catch (err) {
    console.warn(
      '[AgentWatcher] Change streams not available, fallback to polling:',
      err?.message || err,
    );
    startAgentPolling();
  }
}

function startAgentPolling() {
  if (pollingInterval) return;
  pollingInterval = setInterval(async () => {
    if (!isLeader) return;
    const hasAgents = await checkAgentsCount();
    if (hasAgents && !workerProcess) startWorker();
    if (!hasAgents && workerProcess) stopWorker();
  }, 5000);
}

function stopAgentPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
}

// --- Supervisor Lifecycle ---
export async function startWorkerSupervisor() {
  // Allow explicit forcing of leadership in dev or CI via env
  const forceLeader = process.env.FORCE_LEADER === 'true';
  const devAutoLeader =
    process.env.NODE_ENV !== 'production' && process.env.DEV_LEADER !== 'false';

  if (forceLeader || devAutoLeader) {
    console.log(
      '[WorkerSupervisor] Running as leader due to env override or non-production environment.',
    );
    isLeader = true;
    leaderRenewInterval = setInterval(
      renewLeader,
      (LEADER_TTL_SECONDS * 1000) / 2,
    );
    const hasAgents = await checkAgentsCount();
    if (hasAgents) startWorker();
    await setupAgentWatcher();
    return;
  }

  const gotLock = await tryAcquireLeader();
  if (!gotLock) {
    console.log(
      '[WorkerSupervisor] Not leader. Worker will not be supervised on this node.',
    );
    return;
  }

  console.log('[WorkerSupervisor] Leadership acquired.');
  leaderRenewInterval = setInterval(
    renewLeader,
    (LEADER_TTL_SECONDS * 1000) / 2,
  );

  const hasAgents = await checkAgentsCount();
  if (hasAgents) startWorker();
  await setupAgentWatcher();
}

export async function stopWorkerSupervisor() {
  try {
    stopAgentPolling();
    if (agentStream) {
      try {
        await agentStream.close();
      } catch {}
      agentStream = null;
    }
    if (leaderRenewInterval) {
      clearInterval(leaderRenewInterval);
      leaderRenewInterval = null;
    }
    await releaseLeader();
    isLeader = false;
    stopWorker();
  } catch (err) {
    console.warn('[WorkerSupervisor] stop error:', err?.message || err);
  }
}
