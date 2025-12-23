// controllers/cv.sse.controller.js
import mongoose from 'mongoose';
import { Student } from '../models/student.model.js';

export const cvGenerationSSE = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { _id: userId } = req.user;

    console.log('🔗 SSE Connection requested for job:', jobId, 'user:', userId);

    // Validate jobId
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ error: 'Invalid job ID' });
    }

    // Set SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    });

    // Send initial connection confirmation
    res.write(
      `event: connected\ndata: ${JSON.stringify({
        type: 'connected',
        jobId,
        message: 'SSE connection established',
      })}\n\n`,
    );

    let isConnected = true;
    let checkCount = 0;
    const maxChecks = 300; // ~10 minutes timeout (300 * 2000ms)

    const checkStatus = async () => {
      if (!isConnected || checkCount >= maxChecks) {
        if (checkCount >= maxChecks) {
          console.log(`⏰ SSE Timeout for job: ${jobId}`);
          res.write(
            `event: timeout\ndata: ${JSON.stringify({
              type: 'timeout',
              message: 'CV generation timeout',
            })}\n\n`,
          );
          res.end();
        }
        return;
      }

      try {
        console.log(`📊 SSE Status check ${checkCount + 1} for job: ${jobId}`);

        // FIX: Query by cvs._id instead of cvs.jobId
        const student = await Student.findOne(
          {
            _id: userId,
            'cvs._id': new mongoose.Types.ObjectId(jobId), // ✅ Changed to _id
          },
          { 'cvs.$': 1 },
        );

        console.log('📋 Student found:', !!student);
        console.log('📋 CVs found:', student?.cvs?.length);

        if (!student || !student.cvs.length) {
          console.log(`❌ CV job not found: ${jobId}`);
          res.write(
            `event: error\ndata: ${JSON.stringify({
              type: 'error',
              error: 'CV job not found',
            })}\n\n`,
          );
          res.end();
          isConnected = false;
          return;
        }

        const cvJob = student.cvs[0];
        console.log(`📋 Current CV job status: ${cvJob.status}`);

        const statusData = {
          type: 'status',
          jobId: cvJob._id.toString(), // ✅ Use _id instead of jobId
          status: cvJob.status,
          progress: getProgressStatus(cvJob.status),
          cvData: cvJob.cvData,
          error: cvJob.error,
          createdAt: cvJob.createdAt,
          completedAt: cvJob.completedAt,
          jobContextString: cvJob.jobContextString,
          finalTouch: cvJob.finalTouch,
        };

        // Send status update
        console.log(`📤 Sending SSE status update: ${cvJob.status}`);
        res.write(`event: status\ndata: ${JSON.stringify(statusData)}\n\n`);

        // Check if completed or failed
        if (cvJob.status === 'completed' || cvJob.status === 'failed') {
          console.log(`🎯 CV generation ${cvJob.status} for job: ${jobId}`);
          res.write(
            `event: complete\ndata: ${JSON.stringify({
              type: 'complete',
              status: cvJob.status,
              jobId: cvJob._id.toString(), // ✅ Use _id instead of jobId
              message:
                cvJob.status === 'completed'
                  ? 'CV generation completed successfully'
                  : 'CV generation failed',
              cvData: cvJob.cvData, // ✅ Include the actual data
              error: cvJob.error, // ✅ Include error if failed
            })}\n\n`,
          );
          res.end();
          isConnected = false;
          return;
        }

        // Continue polling if still pending
        checkCount++;
        setTimeout(checkStatus, 2000); // Check every 2 seconds
      } catch (error) {
        console.error('❌ SSE status check error:', error);
        res.write(
          `event: error\ndata: ${JSON.stringify({
            type: 'error',
            error: 'Failed to check CV status',
          })}\n\n`,
        );
        res.end();
        isConnected = false;
      }
    };

    // Start the status checking
    checkStatus();

    // Handle client disconnect
    req.on('close', () => {
      console.log(`🔴 SSE connection closed for job: ${jobId}`);
      isConnected = false;
      res.end();
    });

    // Handle connection errors
    req.on('error', (error) => {
      console.error('🔴 SSE connection error:', error);
      isConnected = false;
      res.end();
    });
  } catch (error) {
    console.error('❌ SSE connection setup error:', error);
    res.status(500).json({ error: 'Failed to establish SSE connection' });
  }
};

// Also fix the getCVGenerationStatus endpoint
export const getCVGenerationStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { _id: userId } = req.user;

    console.log('📡 GET Status request for job:', jobId);

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ error: 'Invalid job ID' });
    }

    // FIX: Query by cvs._id instead of cvs.jobId
    const student = await Student.findOne(
      {
        _id: userId,
        'cvs._id': new mongoose.Types.ObjectId(jobId), // ✅ Changed to _id
      },
      { 'cvs.$': 1 },
    );

    console.log('📋 GET Status - Student found:', !!student);
    console.log('📋 GET Status - CVs found:', student?.cvs?.length);

    if (!student || !student.cvs.length) {
      return res.status(404).json({ error: 'CV job not found' });
    }

    const cvJob = student.cvs[0];
    console.log('📋 GET Status - Current status:', cvJob.status);

    return res.json({
      jobId: cvJob._id, // ✅ Use _id instead of jobId
      status: cvJob.status,
      cvData: cvJob.cvData,
      error: cvJob.error,
      createdAt: cvJob.createdAt,
      completedAt: cvJob.completedAt,
      jobContextString: cvJob.jobContextString,
      finalTouch: cvJob.finalTouch,
    });
  } catch (error) {
    console.error('❌ Error fetching CV status:', error);
    return res.status(500).json({ error: 'Failed to fetch CV status' });
  }
};

// Helper function to get progress status
const getProgressStatus = (status) => {
  switch (status) {
    case 'pending':
      return { percentage: 20, message: 'Queuing CV generation...' };
    case 'processing':
      return { percentage: 50, message: 'Generating CV content...' };
    case 'completed':
      return { percentage: 100, message: 'CV generation complete!' };
    case 'failed':
      return { percentage: 0, message: 'CV generation failed' };
    default:
      return { percentage: 10, message: 'Initializing...' };
  }
};
