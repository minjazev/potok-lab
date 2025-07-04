import { N8nWorkflow, N8nWorkflowExecution } from '../types/n8n';

const N8N_API_URL = '/api/v1';

const getAuthHeaders = () => {
  const n8nToken = localStorage.getItem('n8n_authenticated_token'); // Assuming you'll store the actual token here
  console.log('N8N Token from localStorage:', n8nToken ? 'Present' : 'Missing');
  return {
    'Content-Type': 'application/json',
    'X-N8N-API-KEY': n8nToken || '', // Use the token from localStorage or an empty string if not found
  };
};

export const n8nService = {
  async getWorkflows(): Promise<N8nWorkflow[]> {
    console.log('Fetching workflows from API...');
    const response = await fetch(`${N8N_API_URL}/workflows`, {
      headers: getAuthHeaders(),
    });
    console.log('API response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Неизвестная ошибка' }));
      console.error('API error:', errorData);
      throw new Error(`Ошибка при загрузке воркфлоу: ${response.status} - ${errorData.message || response.statusText}`);
    }
    const result = await response.json();
    console.log('API response structure:', Object.keys(result));
    
    if (result && Array.isArray(result.data)) {
      console.log('Found workflows:', result.data.length);
      return result.data;
    } else {
      console.error('Unexpected API response format:', result);
      throw new Error('Неожиданный формат ответа API: воркфлоу не найдены в свойстве data или data не является массивом.');
    }
  },

  async getWorkflow(workflowId: string): Promise<N8nWorkflow> {
    console.log(`Fetching specific workflow: ${workflowId}`);
    const response = await fetch(`${N8N_API_URL}/workflows/${workflowId}`, {
      headers: getAuthHeaders(),
    });
    console.log(`Workflow API response status: ${response.status}`);
    console.log(`Workflow API response headers:`, Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Неизвестная ошибка' }));
      console.error('Workflow API error:', errorData);
      throw new Error(`Ошибка при загрузке воркфлоу: ${response.status} - ${errorData.message || response.statusText}`);
    }
    const result = await response.json();
    console.log(`Workflow ${workflowId} data structure:`, Object.keys(result));
    console.log(`Workflow ${workflowId} has nodes:`, result.data?.nodes?.length || result.nodes?.length || 0);
    console.log(`Workflow ${workflowId} returned data:`, result.data ?? result);
    
    return result.data ?? result;
  },

  async updateWorkflow(workflowId: string, workflowData: any): Promise<void> {
    console.log(`Sending update request for workflow ${workflowId}:`, {
      id: workflowData.id,
      name: workflowData.name,
      nodesCount: workflowData.nodes?.length,
      hasSchedule: !!workflowData.nodes?.[0]?.parameters?.cronExpression
    });
    
    // Отправляем все данные воркфлоу, а не только nodes
    const response = await fetch(`${N8N_API_URL}/workflows/${workflowId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(workflowData),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Неизвестная ошибка' }));
      throw new Error(`Ошибка при обновлении воркфлоу: ${response.status} - ${errorData.message || response.statusText}`);
    }
    
    console.log(`Successfully updated workflow ${workflowId}`);
  },

  async getWorkflowSchedule(workflowId: string): Promise<{ dayOfWeek: string; hour: string; minute: string } | null> {
    try {
      const workflow = await this.getWorkflow(workflowId);
      
      if (!workflow) {
        console.log(`Workflow ${workflowId} not found or returned null`);
        return null;
      }
      
      console.log(`Getting schedule for workflow ${workflowId}:`, workflow.name || 'Unnamed');
      
      if (!workflow.nodes || workflow.nodes.length === 0) {
        console.log('No nodes found in workflow');
        return null;
      }

      // Ищем cron нод среди всех нодов
      console.log('Searching for cron nodes among', workflow.nodes.length, 'nodes');
      workflow.nodes.forEach((node, index) => {
        if (node.type === 'n8n-nodes-base.cron' || node.type === 'n8n-nodes-base.scheduleTrigger') {
          console.log(`Found cron node at index ${index}:`, node.name, node.type);
        }
      });
      
      const cronNode = workflow.nodes.find(node => 
        node.type === 'n8n-nodes-base.cron' || 
        node.type === 'n8n-nodes-base.scheduleTrigger'
      );

      if (!cronNode) {
        console.log('No cron node found in workflow');
        return null;
      }

      console.log('Found cron node:', cronNode?.name || 'Unnamed', cronNode?.parameters);

      const parameters = cronNode.parameters;
      if (!parameters) {
        console.log('No parameters in cron node');
        return null;
      }

      let scheduleData = null;

      // Проверяем triggerTimes (новый формат n8n)
      if (parameters.triggerTimes && parameters.triggerTimes.item && parameters.triggerTimes.item.length > 0) {
        const triggerTime = parameters.triggerTimes.item[0];
        console.log('Found triggerTimes:', triggerTime);
        
        if (triggerTime.mode === 'everyWeek' && triggerTime.weekday !== undefined && triggerTime.hour !== undefined) {
          scheduleData = {
            dayOfWeek: triggerTime.weekday.toString(),
            hour: triggerTime.hour.toString().padStart(2, '0'),
            minute: triggerTime.minute ? triggerTime.minute.toString().padStart(2, '0') : '00'
          };
        }
      }
      
      // Проверяем cronExpression (старый формат)
      if (!scheduleData && parameters.cronExpression) {
        console.log('Found cronExpression:', parameters.cronExpression);
        const cronParts = parameters.cronExpression.split(' ');
        if (cronParts.length >= 5) {
          // cron формат: minute hour day month dayOfWeek
          scheduleData = {
            minute: cronParts[0],
            hour: cronParts[1],
            dayOfWeek: cronParts[4],
          };
        }
      }

      // Проверяем другие возможные форматы
      if (!scheduleData && parameters.schedule) {
        console.log('Found schedule parameter:', parameters.schedule);
        scheduleData = parameters.schedule;
      }
      
      if (!scheduleData && parameters.rule) {
        console.log('Found rule parameter:', parameters.rule);
        scheduleData = parameters.rule;
      }

      if (scheduleData) {
        console.log('Extracted schedule data:', scheduleData);
      } else {
        console.log('No schedule data found in cron node');
      }

      return scheduleData;
    } catch (error) {
      console.error('Error getting workflow schedule:', error);
      return null;
    }
  },

  async updateWorkflowSchedule(workflowId: string, schedules: { dayOfWeek: string; hour: string; minute: string }[]): Promise<void> {
    try {
      console.log(`Updating schedule for workflow ${workflowId}:`, schedules);
      const workflow = await this.getWorkflow(workflowId);
      if (!workflow || !workflow.nodes || workflow.nodes.length === 0) {
        throw new Error('Воркфлоу не найден или не содержит нодов');
      }
      // Ищем cron нод среди всех нодов
      const cronNodeIndex = workflow.nodes.findIndex(node =>
        node.type === 'n8n-nodes-base.cron' ||
        node.type === 'n8n-nodes-base.scheduleTrigger'
      );
      if (cronNodeIndex === -1) {
        throw new Error('Воркфлоу не содержит cron нода');
      }
      // Обновляем cron нод с новым расписанием
      const updatedNodes = [...workflow.nodes];
      const cronNode = { ...updatedNodes[cronNodeIndex] };
      // Создаем новый формат triggerTimes для n8n (все значения — строки)
      const newTriggerTimes = {
        item: schedules.map(sch => ({
          mode: 'everyWeek',
          hour: sch.hour.toString(),
          minute: sch.minute.toString(),
          weekday: sch.dayOfWeek.toString()
        }))
      };
      cronNode.parameters = {
        ...cronNode.parameters,
        triggerTimes: newTriggerTimes
      };
      updatedNodes[cronNodeIndex] = cronNode;
      // Собираем минимальный payload, как в рабочем проекте
      const updatePayload = {
        name: workflow.name,
        nodes: updatedNodes,
        connections: workflow.connections,
        settings: workflow.settings
      };
      console.log('Отправляемый объект:', JSON.stringify(updatePayload, null, 2));
      // Обновляем воркфлоу
      await this.updateWorkflow(workflowId, updatePayload);
      // После обновления повторно получаем воркфлоу для проверки
      const updatedWorkflow = await this.getWorkflow(workflowId);
      const updatedCronNode = updatedWorkflow.nodes.find((node: any) => node.type === 'n8n-nodes-base.cron' || node.type === 'n8n-nodes-base.scheduleTrigger');
      console.log('Параметры cron-ноды после обновления:', updatedCronNode?.parameters);
      console.log('triggerTimes после обновления:', JSON.stringify(updatedCronNode?.parameters?.triggerTimes, null, 2));
      console.log(`Successfully updated schedule for workflow ${workflowId}`);
    } catch (error) {
      console.error('Error updating workflow schedule:', error);
      throw new Error('Ошибка при обновлении расписания воркфлоу: ' + (error as Error).message);
    }
  },

  async activateWorkflow(workflowId: string): Promise<void> {
    const response = await fetch(`${N8N_API_URL}/workflows/${workflowId}/activate`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to activate workflow');
    }
  },

  async deactivateWorkflow(workflowId: string): Promise<void> {
    const response = await fetch(`${N8N_API_URL}/workflows/${workflowId}/deactivate`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to deactivate workflow');
    }
  },

  async executeWorkflow(workflowId: string): Promise<N8nWorkflowExecution> {
    const response = await fetch(`${N8N_API_URL}/workflows/${workflowId}/execute`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to execute workflow');
    }
    return response.json();
  },
}; 