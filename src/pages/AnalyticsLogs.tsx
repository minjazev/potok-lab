import React, { useEffect, useState } from 'react';
import { getLogsForLast14Days, AuditLogEntry } from '../services/auditLogger';
import { DocsIcon } from '../icons';

function formatAction(action: string) {
  switch (action) {
    case 'activate': return 'Включение воркфлоу';
    case 'deactivate': return 'Выключение воркфлоу';
    case 'update_schedule': return 'Изменение расписания';
    default: return action;
  }
}

function formatSchedule(schedule: any): string {
  if (!schedule || !Array.isArray(schedule) || schedule.length === 0) return '-';
  const days: Record<string, string> = {
    '0': 'Воскресенье', '1': 'Понедельник', '2': 'Вторник', '3': 'Среда', '4': 'Четверг', '5': 'Пятница', '6': 'Суббота',
  };
  return schedule.map((sch: any) => {
    const day = days[sch.dayOfWeek] || sch.dayOfWeek;
    return `${day}, ${sch.hour}:${sch.minute}`;
  }).join('; ');
}

function formatValue(log: AuditLogEntry, type: 'old' | 'new') {
  if (log.action === 'activate' || log.action === 'deactivate') {
    const active = type === 'old' ? log.old_value?.active : log.new_value?.active;
    return active ? 'Воркфлоу был включён' : 'Воркфлоу был выключен';
  }
  if (log.action === 'update_schedule') {
    const val = type === 'old' ? log.old_value : log.new_value;
    return formatSchedule(val);
  }
  return '-';
}

const LogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getLogsForLast14Days();
      setLogs(data || []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-gray-700 dark:bg-gray-800 sm:px-7.5 xl:pb-1">
        <div className="flex items-center gap-3 mb-6">
          <DocsIcon className="w-8 h-8 text-blue-500" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Логи действий за 14 дней</h2>
        </div>
        <div className="overflow-x-auto rounded-xl">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Дата/время</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Действие</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Воркфлоу</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Старое значение</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Новое значение</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-200">Пользователь</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8 text-lg text-gray-500 dark:text-gray-400">Загрузка...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-lg text-gray-500 dark:text-gray-400">Нет логов за последние 14 дней</td></tr>
              ) : (
                logs.map((log, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}>
                    <td className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 text-gray-900 dark:text-gray-100">{log.timestamp ? new Date(log.timestamp).toLocaleString() : '-'}</td>
                    <td className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 font-medium">
                      <span className={
                        log.action === 'activate' ? 'text-green-600 dark:text-green-400' :
                        log.action === 'deactivate' ? 'text-red-600 dark:text-red-400' :
                        log.action === 'update_schedule' ? 'text-blue-600 dark:text-blue-400' : 'dark:text-gray-200'
                      }>
                        {formatAction(log.action)}
                      </span>
                    </td>
                    <td className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 font-semibold text-gray-900 dark:text-white">{log.workflow_name || log.workflow_id}</td>
                    <td className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300">{formatValue(log, 'old')}</td>
                    <td className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300">{formatValue(log, 'new')}</td>
                    <td className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                      <span className="font-semibold text-gray-800 dark:text-gray-200">{log.user_name}</span><br />
                      <span className="text-xs text-gray-500 dark:text-gray-400">{log.user_email}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LogsPage; 