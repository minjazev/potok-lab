import React, { useEffect, useState } from 'react';
import { n8nService } from '../services/n8nService';
import { N8nWorkflow } from '../types/n8n';
import { ListIcon, PlugInIcon, GroupIcon, GridIcon, FolderIcon, CheckCircleIcon, AlertIcon, TableIcon, PieChartIcon, TaskIcon, InfoIcon } from '../icons';
import { EditScheduleModal } from '../components/workflow/EditScheduleModal';
import { useModal } from '../hooks/useModal';
import Button from '../components/ui/button/Button';
import { Play, Pause } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/ui/alert/Alert';
import { logAuditToSupabase } from '../services/auditLogger';

interface WorkflowProps {
  category?: string;
  tag?: string;
  title?: string;
  description?: string;
}

// Новый тип для массива расписаний
type ScheduleData = { 
  mode: string;
  dayOfWeek: string;
  hour: string;
  minute: string 
};

// Define passwords for categories that require authentication
const passwords: Record<string, string> = {
  analysis: '11',
  development: '22',
  'team-design': '33',
  'project-office': '44',
  test: 'testpass',
};

const Workflow: React.FC<WorkflowProps> = ({ category, tag, title, description }) => {
  const [workflows, setWorkflows] = useState<N8nWorkflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<N8nWorkflow | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleData | null>(null);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [workflowSchedules, setWorkflowSchedules] = useState<Record<string, ScheduleData[]>>({});
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  const { isOpen, openModal, closeModal } = useModal();

  // Auth state from context
  const { user, login, isAuthenticated } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  const [inputUsername, setInputUsername] = useState('');
  const [inputEmail, setInputEmail] = useState('');
  const [inputPassword, setInputPassword] = useState('');

  // Determine the category key for authentication
  const authCategory = category || (tag === 'Project Office' ? 'project-office' : undefined);
  // Не требуем аутентификацию для test
  const needsAuth = !!(authCategory && passwords[authCategory] && authCategory !== 'test');
  const isAuthedForCategory = !!(authCategory && isAuthenticated(authCategory));

  // Reset auth form when the category changes
  useEffect(() => {
    setAuthError(null);
    setInputPassword('');
    // Keep username and email if user is already logged in
    if (user) {
      setInputUsername(user.name);
      setInputEmail(user.email);
    } else {
      setInputUsername('');
      setInputEmail('');
    }
  }, [authCategory, user]);

  // IDs of workflows to be hidden
  const hiddenWorkflowIds = [
    'nOeSmorRuGenRVjo',
    '2C3AppAXPmHmwAFH',
    'Rgola8AJBHaply3l',
  ];

  useEffect(() => {
    console.log('Component mounted or dependencies changed, fetching workflows...');
    console.log('Current category:', category);
    console.log('Current tag:', tag);
    fetchWorkflows();
  }, [category, tag]);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const data = await n8nService.getWorkflows();
      let visibleWorkflows = data.filter((workflow: N8nWorkflow) => !hiddenWorkflowIds.includes(workflow.id));

      // Handle tag filtering for exact match
      if (tag) {
        visibleWorkflows = visibleWorkflows.filter((workflow: N8nWorkflow) =>
          (workflow.tags || []).some(t =>
            (typeof t === 'string' ? t : (t as any).name) === tag
          )
        );
      }
      // Handle category filtering for partial match
      else if (category) {
        if (category === 'test') {
          visibleWorkflows = visibleWorkflows.filter((workflow: N8nWorkflow) =>
            (workflow.tags || []).some(t =>
              (typeof t === 'string' ? t : (t as any).name || '').toLowerCase().includes('тест')
            )
          );
        } else {
          visibleWorkflows = visibleWorkflows.filter((workflow: N8nWorkflow) => {
            return workflow.tags?.some(t => {
              const tagName = typeof t === 'string' ? t : (t as any).name;
              return tagName.toLowerCase().includes(category.toLowerCase());
            });
          });
        }
      }

      setWorkflows(visibleWorkflows);
      await fetchWorkflowSchedules(visibleWorkflows);
      setError(null);
    } catch (err) {
      setError('Ошибка при загрузке воркфлоу: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Новый парсер: возвращает массив расписаний
  const extractAllSchedulesFromWorkflow = (workflow: N8nWorkflow): ScheduleData[] => {
    if (!workflow.nodes || workflow.nodes.length === 0) return [];
    const cronNode = workflow.nodes.find(node => node.type === 'n8n-nodes-base.cron' || node.type === 'n8n-nodes-base.scheduleTrigger');
    if (!cronNode) return [];
    const parameters = cronNode.parameters;
    const schedules: ScheduleData[] = [];
    if (parameters.triggerTimes && parameters.triggerTimes.item && parameters.triggerTimes.item.length > 0) {
      for (const triggerTime of parameters.triggerTimes.item) {
        let weekday = triggerTime.weekday;
        if (weekday === undefined) {
          const nodeName = cronNode.name?.toLowerCase() || '';
          if (nodeName.includes('понедельник') || nodeName.includes('пн')) weekday = '1';
          else if (nodeName.includes('вторник') || nodeName.includes('вт')) weekday = '2';
          else if (nodeName.includes('среда') || nodeName.includes('ср')) weekday = '3';
          else if (nodeName.includes('четверг') || nodeName.includes('чт')) weekday = '4';
          else if (nodeName.includes('пятница') || nodeName.includes('пт')) weekday = '5';
          else if (nodeName.includes('суббота') || nodeName.includes('сб')) weekday = '6';
          else if (nodeName.includes('воскресенье') || nodeName.includes('вс')) weekday = '0';
          else weekday = '1';
        }
        schedules.push({
          mode: 'everyWeek',
          dayOfWeek: weekday.toString(),
          hour: triggerTime.hour.toString().padStart(2, '0'),
          minute: triggerTime.minute ? triggerTime.minute.toString().padStart(2, '0') : '00',
        });
      }
    } else if (parameters.cronExpression) {
      const cronParts = parameters.cronExpression.split(' ');
      if (cronParts.length >= 5) {
        // Примитивный разбор cron: если все поля * — everyMinute, если только minute * — everyHour, если только dayOfWeek * — everyDay, иначе everyWeek
        let mode = 'everyWeek';
        if (cronParts[0] === '*' && cronParts[1] === '*' && cronParts[2] === '*' && cronParts[3] === '*' && cronParts[4] === '*') {
          mode = 'everyMinute';
        } else if (cronParts[1] === '*' && cronParts[2] === '*' && cronParts[3] === '*' && cronParts[4] === '*') {
          mode = 'everyHour';
        } else if (cronParts[2] === '*' && cronParts[3] === '*' && cronParts[4] === '*') {
          mode = 'everyDay';
        }
        schedules.push({
          mode,
          minute: cronParts[0],
          hour: cronParts[1],
          dayOfWeek: cronParts[4],
        });
      }
    } else if (parameters.schedule) {
      // Можно доработать, если есть структура schedule
      schedules.push({
        mode: 'everyWeek',
        ...parameters.schedule,
      });
    } else if (parameters.rule) {
      schedules.push({
        mode: 'everyWeek',
        ...parameters.rule,
      });
    }
    return schedules;
  };

  // fetchWorkflowSchedules теперь сохраняет массив расписаний
  const fetchWorkflowSchedules = async (workflows: N8nWorkflow[]) => {
    const schedules: Record<string, ScheduleData[]> = {};
    for (const workflow of workflows) {
      try {
        const allSchedules = extractAllSchedulesFromWorkflow(workflow);
        schedules[workflow.id] = allSchedules;
      } catch (err) {
        schedules[workflow.id] = [];
      }
    }
    setWorkflowSchedules(schedules);
  };

  const handleToggleWorkflow = async (workflow: N8nWorkflow) => {
    if (needsAuth && !isAuthedForCategory) return;

    try {
      const prevActive = workflow.active;
      if (workflow.active) {
        await n8nService.deactivateWorkflow(workflow.id);
      } else {
        await n8nService.activateWorkflow(workflow.id);
      }
      await fetchWorkflows();
      // Логирование действия
      await logAuditToSupabase({
        action: prevActive ? 'deactivate' : 'activate',
        workflow_id: workflow.id,
        workflow_name: workflow.name,
        old_value: { active: prevActive },
        new_value: { active: !prevActive },
        user_name: user?.name || '',
        user_email: user?.email || '',
      });
    } catch (err) {
      setError('Ошибка при изменении состояния воркфлоу: ' + (err as Error).message);
    }
  };

  // handleEditSchedule теперь тоже использует массив
  const handleEditSchedule = async (workflow: N8nWorkflow) => {
    if (needsAuth && !isAuthedForCategory) return;

    try {
      console.log(`User '${user?.name}' is opening edit modal for workflow '${workflow.name}' (${workflow.id})`);
      setScheduleLoading(true);
      setSelectedWorkflow(workflow);
      const allSchedules = extractAllSchedulesFromWorkflow(workflow);
      setSelectedSchedule(allSchedules[0] || null); // для модалки оставим первый, но можно расширить
      openModal();
    } catch (err) {
      setError('Ошибка при получении расписания воркфлоу: ' + (err as Error).message);
    } finally {
      setScheduleLoading(false);
    }
  };

  // handleSaveSchedule теперь принимает массив расписаний
  const handleSaveSchedule = async (schedules: ScheduleData[]) => {
    if (!selectedWorkflow) return;
    try {
      const oldSchedule = workflowSchedules[selectedWorkflow.id] || [];
      await n8nService.updateWorkflowSchedule(selectedWorkflow.id, schedules);
      setWorkflowSchedules(prev => ({
        ...prev,
        [selectedWorkflow.id]: schedules
      }));
      setWorkflows(prev => prev.map(workflow =>
        workflow.id === selectedWorkflow.id
          ? { ...workflow, updatedAt: new Date().toISOString() }
          : workflow
      ));
      setNotification({ type: 'success', message: 'Расписание воркфлоу успешно обновлено.' });
      setTimeout(() => setNotification(null), 3000);
      // Логирование действия
      await logAuditToSupabase({
        action: 'update_schedule',
        workflow_id: selectedWorkflow.id,
        workflow_name: selectedWorkflow.name,
        old_value: oldSchedule,
        new_value: schedules,
        user_name: user?.name || '',
        user_email: user?.email || '',
      });
    } catch (err) {
      setNotification({ type: 'error', message: (err as Error).message || 'Ошибка при сохранении воркфлоу' });
      setTimeout(() => setNotification(null), 4000);
      throw new Error('Ошибка при сохранении расписания: ' + (err as Error).message);
    }
  };

  // Функция для форматирования массива расписаний
  const formatSchedules = (schedules: ScheduleData[] | null | undefined) => {
    if (!schedules || schedules.length === 0) return 'Не настроено';
    const days = {
      '0': 'Воскресенье',
      '1': 'Понедельник',
      '2': 'Вторник',
      '3': 'Среда',
      '4': 'Четверг',
      '5': 'Пятница',
      '6': 'Суббота',
    };
    return (
      <ul className="list-disc ml-4">
        {schedules.map((sch, idx) => (
          <li key={idx}>{days[sch.dayOfWeek as keyof typeof days] || 'Неизвестно'}, {sch.hour}:{sch.minute}</li>
        ))}
      </ul>
    );
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authCategory && passwords[authCategory] === inputPassword) {
      login(inputUsername, inputEmail, authCategory);
      setAuthError(null);
      setInputPassword(''); // Clear password field for security
    } else {
      setAuthError('Неверный пароль.');
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Ошибка!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 dark:bg-gray-900 dark:text-white min-h-screen">
      {/* Уведомление */}
      {notification && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center">
          {/* Блюр заднего фона */}
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[6px] transition-all duration-300" />
          <div
            className={
              `relative w-full max-w-md pointer-events-auto transition-opacity duration-300 ` +
              `${notification ? 'opacity-100 scale-100' : 'opacity-0 scale-95'} `
            }
            style={{
              boxShadow: '8px 8px 24px #e3e6ee, -8px -8px 24px #ffffff',
              borderRadius: '1.5rem',
              background: 'linear-gradient(145deg, #f5f7fa 60%, #e3e6ee 100%)',
              minWidth: 'min(90vw,320px)',
              maxWidth: 'min(95vw,420px)',
              padding: '1.5rem',
              position: 'relative',
              pointerEvents: 'auto',
              border: '1.5px solid #f0f1f6',
            }}
            role="alert"
          >
            <button
              onClick={() => setNotification(null)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-full p-1 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Закрыть уведомление"
              tabIndex={0}
              style={{ pointerEvents: 'auto' }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M6 6L14 14M14 6L6 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
            <Alert
              variant={notification.type}
              title={notification.type === 'success' ? 'Изменения сохранены' : 'Ошибка'}
              message={notification.message}
            />
          </div>
        </div>
      )}
      {authCategory === 'test' && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
          <h3 className="font-semibold text-lg mb-2 dark:text-white">Аутентификация не требуется</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Данный раздел системы предназначен для тестирования workflow
          </p>
        </div>
      )}
      {needsAuth && !isAuthedForCategory && authCategory !== 'test' && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
          <form onSubmit={handleAuthSubmit}>
            <h3 className="font-semibold text-lg mb-2 dark:text-white">Требуется аутентификация</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Для изменения воркфлоу в этой категории, пожалуйста, введите ваши данные.
            </p>
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1" style={{ minWidth: '150px' }}>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Имя пользователя</label>
                <input
                  type="text"
                  id="username"
                  value={inputUsername}
                  onChange={(e) => setInputUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                  required
                />
              </div>
              <div className="flex-1" style={{ minWidth: '150px' }}>
                <label htmlFor="email-auth" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Почта</label>
                <input
                  type="email"
                  id="email-auth"
                  value={inputEmail}
                  onChange={(e) => setInputEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                  required
                />
              </div>
              <div className="flex-1" style={{ minWidth: '150px' }}>
                <label htmlFor="password-auth" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Пароль</label>
                <input
                  type="password"
                  id="password-auth"
                  value={inputPassword}
                  onChange={(e) => setInputPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                  required
                />
              </div>
              <Button type="submit" size="sm" className="px-3 py-1 text-xs">Войти</Button>
            </div>
            {authError && <p className="text-red-500 text-sm mt-2">{authError}</p>}
          </form>
        </div>
      )}

      {needsAuth && isAuthedForCategory && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6 flex items-center">
          <CheckCircleIcon className="w-6 h-6 text-green-500 mr-3" />
          <p className="text-gray-800 dark:text-white">
            Аутентификация для категории <span className="font-semibold">{title}</span> пройдена.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {/* {title && <h1 className="text-2xl font-bold dark:text-white">{title}</h1>} */}
        {description && <p className="text-gray-600 dark:text-gray-400">{description}</p>}

        <div className="grid gap-6">
          {workflows.map((workflow) => (
            <div
              key={workflow.id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition p-6 flex flex-col gap-y-4 md:gap-y-6"
            >
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  {(() => {
                    const workflowTags = workflow.tags?.map(tag => (typeof tag === 'string' ? tag : (tag as any).name).toLowerCase()) || [];
                    if (
                      category === 'analysis' ||
                      category === 'development' ||
                      category === 'team-design' ||
                      tag === 'Project Office'
                    ) {
                      return <PlugInIcon className="w-6 h-6 text-gray-700 dark:text-gray-200 shrink-0" />;
                    } else if (category === 'test' && workflowTags.some(t => t.includes('тест'))) {
                      return <TaskIcon className="w-6 h-6 text-gray-700 dark:text-gray-200 shrink-0" />;
                    } else if (workflowTags.includes('analysis')) {
                      return <ListIcon className="w-6 h-6 text-gray-700 dark:text-gray-200 shrink-0" />;
                    } else if (workflowTags.includes('development')) {
                      return <PlugInIcon className="w-6 h-6 text-gray-700 dark:text-gray-200 shrink-0" />;
                    } else if (workflowTags.includes('team-design')) {
                      return <GroupIcon className="w-6 h-6 text-gray-700 dark:text-gray-200 shrink-0" />;
                    } else if (workflowTags.includes('project office')) {
                      return <PieChartIcon className="w-6 h-6 text-gray-700 dark:text-gray-200 shrink-0" />;
                    } else if (category === 'all') {
                      return <GridIcon className="w-6 h-6 text-gray-700 dark:text-gray-200 shrink-0" />;
                    } else {
                      return <FolderIcon className="w-6 h-6 text-gray-700 dark:text-gray-200 shrink-0" />;
                    }
                  })()}
                  <span className="font-bold text-lg md:text-xl truncate dark:text-white">{workflow.name}</span>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-auto md:ml-0 mt-2 md:mt-0 ${
                    workflow.active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800 dark:text-gray-200 dark:bg-gray-700'
                  }`}
                >
                  {workflow.active ? 'Активен' : 'Неактивен'}
                </span>
              </div>

              {/* Metadata & Schedule */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex flex-col gap-1">
                  <span>Создан: <span className="font-medium">{new Date(workflow.createdAt || workflow.updatedAt).toLocaleString()}</span></span>
                  <span>Обновлен: <span className="font-medium">{new Date(workflow.updatedAt).toLocaleString()}</span></span>
                </div>
                {/* Schedule block */}
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-gray-800 dark:text-white mb-1 flex items-center gap-1">
                    <span role="img" aria-label="clock">⏰</span> Расписание:
                  </span>
                  {Array.isArray(workflowSchedules[workflow.id]) && workflowSchedules[workflow.id].length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {workflowSchedules[workflow.id].map((sch, idx) => {
                        const days = {
                          '0': 'Вс', '1': 'Пн', '2': 'Вт', '3': 'Ср', '4': 'Чт', '5': 'Пт', '6': 'Сб',
                        };
                        return (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-700 dark:text-gray-200"
                          >
                            {days[sch.dayOfWeek as keyof typeof days] || '??'}, {sch.hour}:{sch.minute}
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">Не настроено</span>
                  )}
                </div>
              </div>

              {/* Status block */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex items-center gap-2">
                  {workflow.active ? (
                    <Play className="w-5 h-5 text-green-500" />
                  ) : (
                    <Pause className="w-5 h-5 text-gray-400" />
                  )}
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white">
                      {workflow.active ? 'Воркфлоу активен' : 'Воркфлоу неактивен'}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      {workflow.active
                        ? 'Воркфлоу будет выполняться по расписанию'
                        : 'Воркфлоу не будет выполняться по расписанию'}
                    </p>
                  </div>
                </div>
                <div className="flex-1" />
                <div className="flex items-center gap-2 mt-2 md:mt-0">
                  <Button
                    onClick={() => handleEditSchedule(workflow)}
                    disabled={scheduleLoading || (needsAuth && !isAuthedForCategory)}
                    size="sm"
                    variant="outline"
                    className="px-3 py-1 text-xs"
                  >
                    {scheduleLoading ? 'Загрузка...' : (needsAuth && !isAuthedForCategory) ? 'Заблокировано' : 'Редактировать'}
                  </Button>
                  <label className={`relative inline-flex items-center ml-2 ${needsAuth && !isAuthedForCategory ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                    <input
                      type="checkbox"
                      value=""
                      className="sr-only peer"
                      checked={workflow.active}
                      onChange={() => handleToggleWorkflow(workflow)}
                      disabled={needsAuth && !isAuthedForCategory}
                    />
                    <div className="workflow-toggle-switch w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              {/* Tags */}
              {workflow.tags && workflow.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {workflow.tags.map((tag) => {
                    return (
                      <span
                        key={typeof tag === 'string' ? tag : (tag as any).id || (tag as any).name}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 hover:shadow-md transition cursor-pointer"
                        tabIndex={0}
                      >
                        {typeof tag === 'string' ? tag : (tag as any).name || (tag as any).id || '[Объект]'}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Модальное окно редактирования расписания */}
      {selectedWorkflow && (
        <EditScheduleModal
          isOpen={isOpen}
          onClose={closeModal}
          workflowName={selectedWorkflow.name}
          onSave={handleSaveSchedule}
          initialSchedule={workflowSchedules[selectedWorkflow.id] || []}
        />
      )}
    </div>
  );
};

export default Workflow; 