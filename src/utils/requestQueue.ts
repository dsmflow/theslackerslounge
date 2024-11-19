import { MODEL_CONFIGS } from '../types/modelMatrix';

export interface QueuedRequest {
  id: string;
  modelId: string;
  prompt: string;
  parameters: Record<string, any>;
  status: 'pending' | 'processing' | 'complete' | 'failed';
  timestamp: number;
  error?: string;
  progress?: number;
  position?: number;
}

const QUEUE_KEY = 'image-request-queue';
const MAX_CONCURRENT_REQUESTS = 1;
const MAX_QUEUE_SIZE = 10;
const QUEUE_TIMEOUT = 10 * 60 * 1000; // 10 minutes

class RequestQueue {
  private queue: QueuedRequest[] = [];
  private processingRequests: Set<string> = new Set();
  private subscribers: Set<(queue: QueuedRequest[]) => void> = new Set();

  constructor() {
    this.loadQueue();
    this.startProcessing();
    this.startCleanup();
  }

  private loadQueue() {
    try {
      const stored = localStorage.getItem(QUEUE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
        // Reset any 'processing' requests to 'pending' on load
        this.queue = this.queue.map(req => ({
          ...req,
          status: req.status === 'processing' ? 'pending' : req.status
        }));
      }
    } catch (error) {
      console.error('Failed to load queue:', error);
      this.queue = [];
    }
    this.saveQueue();
  }

  private saveQueue() {
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to save queue:', error);
    }
  }

  private updatePositions() {
    const pendingRequests = this.queue.filter(req => req.status === 'pending');
    pendingRequests.forEach((req, index) => {
      req.position = index + 1;
    });
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback([...this.queue]));
  }

  private async startProcessing() {
    const processNext = async () => {
      // Get next pending request
      const nextRequest = this.queue.find(req => 
        req.status === 'pending' && !this.processingRequests.has(req.id)
      );

      if (nextRequest && this.processingRequests.size < MAX_CONCURRENT_REQUESTS) {
        this.processingRequests.add(nextRequest.id);
        nextRequest.status = 'processing';
        this.saveQueue();
        this.notifySubscribers();

        try {
          // Process the request (implementation in huggingface.ts)
          const result = await this.processRequest(nextRequest);
          
          // Update request status based on result
          const index = this.queue.findIndex(req => req.id === nextRequest.id);
          if (index !== -1) {
            this.queue[index] = {
              ...nextRequest,
              status: result.success ? 'complete' : 'failed',
              error: result.error,
              progress: 100
            };
          }
        } catch (error) {
          // Handle any errors
          const index = this.queue.findIndex(req => req.id === nextRequest.id);
          if (index !== -1) {
            this.queue[index] = {
              ...nextRequest,
              status: 'failed',
              error: error instanceof Error ? error.message : 'Unknown error'
            };
          }
        } finally {
          this.processingRequests.delete(nextRequest.id);
          this.saveQueue();
          this.updatePositions();
          this.notifySubscribers();
        }
      }
    };

    // Start processing loop
    setInterval(async () => {
      if (this.processingRequests.size < MAX_CONCURRENT_REQUESTS) {
        await processNext();
      }
    }, 1000);
  }

  private startCleanup() {
    setInterval(() => {
      const now = Date.now();
      this.queue = this.queue.filter(req => {
        // Keep pending and processing requests
        if (req.status === 'pending' || req.status === 'processing') return true;
        // Keep completed/failed requests that are less than 10 minutes old
        return now - req.timestamp < QUEUE_TIMEOUT;
      });
      this.saveQueue();
      this.updatePositions();
      this.notifySubscribers();
    }, 60000); // Run cleanup every minute
  }

  // Add a new request to the queue
  addRequest(
    modelId: string,
    prompt: string,
    parameters: Record<string, any>
  ): QueuedRequest {
    // Check if model exists
    const modelConfig = MODEL_CONFIGS.find(m => m.id === modelId);
    if (!modelConfig) {
      throw new Error('Invalid model selected');
    }

    // Check queue size
    const pendingCount = this.queue.filter(req => req.status === 'pending').length;
    if (pendingCount >= MAX_QUEUE_SIZE) {
      throw new Error(`Queue is full. Maximum ${MAX_QUEUE_SIZE} pending requests allowed.`);
    }

    const request: QueuedRequest = {
      id: Date.now().toString(),
      modelId,
      prompt,
      parameters,
      status: 'pending',
      timestamp: Date.now(),
      progress: 0
    };

    this.queue.push(request);
    this.updatePositions();
    this.saveQueue();
    this.notifySubscribers();

    return request;
  }

  // Cancel a request
  cancelRequest(id: string) {
    const index = this.queue.findIndex(req => req.id === id);
    if (index !== -1) {
      this.queue[index].status = 'failed';
      this.queue[index].error = 'Cancelled by user';
      this.processingRequests.delete(id);
      this.saveQueue();
      this.updatePositions();
      this.notifySubscribers();
    }
  }

  // Get the current queue state
  getQueue(): QueuedRequest[] {
    return [...this.queue];
  }

  // Subscribe to queue updates
  subscribe(callback: (queue: QueuedRequest[]) => void) {
    this.subscribers.add(callback);
    callback([...this.queue]);
    return () => this.subscribers.delete(callback);
  }

  // Update request progress
  updateProgress(id: string, progress: number) {
    const request = this.queue.find(req => req.id === id);
    if (request) {
      request.progress = progress;
      this.saveQueue();
      this.notifySubscribers();
    }
  }

  // Process a single request (to be implemented in huggingface.ts)
  private async processRequest(request: QueuedRequest): Promise<{ success: boolean; error?: string }> {
    // This will be implemented in huggingface.ts
    return { success: true };
  }
}

// Create a singleton instance
export const requestQueue = new RequestQueue();
