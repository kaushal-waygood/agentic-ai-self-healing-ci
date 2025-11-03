// utils/cvSSEHandler.ts
export class CVSSEHandler {
  private jobId: string;
  private eventSource: EventSource | null;
  private callbacks: {
    onConnected: ((data: any) => void) | null;
    onStatus: ((data: any) => void) | null;
    onProgress: ((data: any) => void) | null;
    onComplete: ((data: any) => void) | null;
    onError: ((data: any) => void) | null;
    onTimeout: ((data: any) => void) | null;
  };
  private options: {
    endpoint: string;
    timeout: number;
  };
  private isConnected: boolean;

  constructor(jobId: string, options: any = {}) {
    this.jobId = jobId;
    this.eventSource = null;
    this.callbacks = {
      onConnected: null,
      onStatus: null,
      onProgress: null,
      onComplete: null,
      onError: null,
      onTimeout: null,
    };
    this.options = {
      endpoint: 'http://127.0.0.1:8080/api/v1/students/sse',
      timeout: 600000, // 10 minutes
      ...options,
    };
    this.isConnected = false;
  }

  connect(): void {
    try {
      const url = `${this.options.endpoint}/${this.jobId}`;
      this.eventSource = new EventSource(url, { withCredentials: true });

      this.eventSource.addEventListener('connected', (event) => {
        this.isConnected = true;
        const data = JSON.parse(event.data);
        if (this.callbacks.onConnected) {
          this.callbacks.onConnected(data);
        }
      });

      this.eventSource.addEventListener('status', (event) => {
        const data = JSON.parse(event.data);
        if (this.callbacks.onStatus) {
          this.callbacks.onStatus(data);
        }
        if (this.callbacks.onProgress && data.progress) {
          this.callbacks.onProgress(data.progress);
        }
      });

      this.eventSource.addEventListener('complete', (event) => {
        const data = JSON.parse(event.data);
        if (this.callbacks.onComplete) {
          this.callbacks.onComplete(data);
        }
        this.close();
      });

      this.eventSource.addEventListener('error', (event) => {
        const data = JSON.parse(event.data);
        if (this.callbacks.onError) {
          this.callbacks.onError(data);
        }
        this.close();
      });

      this.eventSource.addEventListener('timeout', (event) => {
        const data = JSON.parse(event.data);
        if (this.callbacks.onTimeout) {
          this.callbacks.onTimeout(data);
        }
        this.close();
      });

      this.eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        if (this.callbacks.onError) {
          this.callbacks.onError({ error: 'Connection failed' });
        }
        this.close();
      };

      // Set timeout
      setTimeout(() => {
        if (this.isConnected) {
          this.close();
          if (this.callbacks.onTimeout) {
            this.callbacks.onTimeout({ message: 'Connection timeout' });
          }
        }
      }, this.options.timeout);
    } catch (error) {
      console.error('Failed to establish SSE connection:', error);
      if (this.callbacks.onError) {
        this.callbacks.onError({ error: 'Failed to connect' });
      }
    }
  }

  on(event: string, callback: (data: any) => void): CVSSEHandler {
    const eventMap: { [key: string]: string } = {
      connected: 'onConnected',
      status: 'onStatus',
      progress: 'onProgress',
      complete: 'onComplete',
      error: 'onError',
      timeout: 'onTimeout',
    };

    if (eventMap[event]) {
      (this.callbacks as any)[eventMap[event]] = callback;
    }
    return this;
  }

  close(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.isConnected = false;
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}
