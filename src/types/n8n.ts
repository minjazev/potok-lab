export interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  nodes: any[];
  connections: any[];
  settings: {
    executionOrder: string;
    saveManualExecutions: boolean;
    callerPolicy: string;
    errorWorkflow: string;
  };
  tags: string[];
  triggerCount: number;
  updatedAt: string;
  createdAt: string;
  versionId: string;
}

export interface N8nWorkflowExecution {
  id: string;
  status: 'running' | 'completed' | 'failed' | 'waiting';
  startedAt: string;
  finishedAt?: string;
  workflowId: string;
  data: any;
} 