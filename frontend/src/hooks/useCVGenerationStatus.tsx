// hooks/useCVGenerationStatus.js - ENHANCED DEBUGGING VERSION
import { useState, useEffect, useRef } from 'react';
import { useSocketContext } from '@/context/SocketContext';

export const useCVGenerationStatus = (jobId) => {
  const { socket, isConnected, connectionError } = useSocketContext();
  const [status, setStatus] = useState(null);
  const [progress, setProgress] = useState({ percentage: 0, message: '' });
  const [error, setError] = useState(null);
  const [cvData, setCvData] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const subscriptionRef = useRef(null);

  useEffect(() => {
    console.log('🔄 useCVGenerationStatus: Effect triggered', {
      jobId,
      hasSocket: !!socket,
      isConnected,
      connectionError,
    });

    // Don't proceed if no jobId or no socket connection
    if (!jobId) {
      console.log('❌ useCVGenerationStatus: No jobId provided');
      return;
    }

    if (!socket || !isConnected) {
      console.log('❌ useCVGenerationStatus: No socket connection', {
        hasSocket: !!socket,
        isConnected,
      });
      return;
    }

    const jobIdStr = jobId.toString();
    console.log('🚀 useCVGenerationStatus: Setting up for job:', jobIdStr);

    // Subscribe to CV status
    const subscribe = () => {
      console.log(
        '📡 useCVGenerationStatus: Attempting subscription to:',
        jobIdStr,
      );

      socket.emit('subscribe-cv-status', jobIdStr, (response) => {
        console.log(
          '📡 useCVGenerationStatus: Subscription response received:',
          {
            jobId: jobIdStr,
            response,
            success: response?.success,
          },
        );

        if (response?.success) {
          setIsSubscribed(true);
          subscriptionRef.current = jobIdStr;
          console.log(
            '✅ useCVGenerationStatus: Successfully subscribed to:',
            jobIdStr,
          );
        } else {
          setIsSubscribed(false);
          console.error('❌ useCVGenerationStatus: Subscription failed:', {
            jobId: jobIdStr,
            response,
            error: response?.error,
          });
        }
      });
    };

    subscribe();

    const handleCVStatusUpdate = (data) => {
      console.log('📡 useCVGenerationStatus: Received status update:', {
        jobId: jobIdStr,
        data,
        matchesOurJob: data.jobId?.toString() === jobIdStr,
      });

      if (data.jobId?.toString() === jobIdStr) {
        console.log('🎯 useCVGenerationStatus: Update matches our job!', {
          oldStatus: status,
          newStatus: data.status,
        });
        setStatus(data.status);
        setProgress(data.progress || { percentage: 0, message: '' });
        setError(data.error || null);
        if (data.cvData) setCvData(data.cvData);
      }
    };

    // Listen for status updates
    socket.on('cv-status-update', handleCVStatusUpdate);

    // Also listen for connection events to resubscribe if needed
    const handleReconnect = () => {
      console.log(
        '🔌 useCVGenerationStatus: Socket reconnected, resubscribing...',
      );
      if (subscriptionRef.current === jobIdStr) {
        setTimeout(subscribe, 1000);
      }
    };

    socket.on('reconnect', handleReconnect);

    // Request current status
    console.log(
      '📡 useCVGenerationStatus: Requesting current status for:',
      jobIdStr,
    );
    socket.emit('get-cv-status', jobIdStr, (statusResponse) => {
      console.log('📡 useCVGenerationStatus: Current status response:', {
        jobId: jobIdStr,
        response: statusResponse,
      });
      if (statusResponse?.success && statusResponse.data) {
        handleCVStatusUpdate(statusResponse.data);
      }
    });

    // Cleanup
    return () => {
      console.log('🧹 useCVGenerationStatus: Cleaning up for job:', jobIdStr);
      socket.off('cv-status-update', handleCVStatusUpdate);
      socket.off('reconnect', handleReconnect);

      if (socket && isConnected && subscriptionRef.current === jobIdStr) {
        socket.emit('unsubscribe-cv-status', jobIdStr, (response) => {
          console.log(
            '📡 useCVGenerationStatus: Unsubscribe response:',
            response,
          );
        });
        setIsSubscribed(false);
        subscriptionRef.current = null;
      }
    };
  }, [socket, jobId, isConnected, connectionError]);

  return {
    status,
    progress,
    error,
    cvData,
    isConnected,
    isSubscribed,
  };
};
