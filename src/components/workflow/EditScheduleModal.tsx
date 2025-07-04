import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/modal';
import Button from '../ui/button/Button';
import { TrashBinIcon } from '../../icons';
import { TimeDisplay } from '../common/TimeDisplay';

interface ScheduleData {
  mode: string;
  dayOfWeek: string;
  hour: string;
  minute: string;
}

interface EditScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflowName: string;
  onSave: (scheduleData: ScheduleData[]) => Promise<void>;
  initialSchedule?: ScheduleData[];
}

const DAYS_OF_WEEK = [
  { value: '1', label: 'Понедельник' },
  { value: '2', label: 'Вторник' },
  { value: '3', label: 'Среда' },
  { value: '4', label: 'Четверг' },
  { value: '5', label: 'Пятница' },
  { value: '6', label: 'Суббота' },
  { value: '0', label: 'Воскресенье' },
];

const MODES = [
  { value: 'everyMinute', label: 'Каждую минуту' },
  { value: 'everyHour', label: 'Каждый час' },
  { value: 'everyDay', label: 'Каждый день' },
  { value: 'everyWeek', label: 'Каждую неделю' },
  { value: 'everyMonth', label: 'Каждый месяц' },
];

export const EditScheduleModal: React.FC<EditScheduleModalProps> = ({
  isOpen,
  onClose,
  workflowName,
  onSave,
  initialSchedule = [],
}) => {
  const [schedules, setSchedules] = useState<ScheduleData[]>([
    { mode: 'everyWeek', dayOfWeek: '1', hour: '09', minute: '00' },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (Array.isArray(initialSchedule) && initialSchedule.length > 0) {
      setSchedules(initialSchedule.map(sch => ({
        mode: sch.mode || 'everyWeek',
        dayOfWeek: sch.dayOfWeek ?? '1',
        hour: sch.hour ?? '09',
        minute: sch.minute ?? '00',
      })));
    } else {
      setSchedules([{ mode: 'everyWeek', dayOfWeek: '1', hour: '09', minute: '00' }]);
    }
  }, [initialSchedule]);

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      await onSave(schedules);
      onClose();
    } catch (err) {
      setError('Ошибка при сохранении расписания: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (idx: number, field: keyof ScheduleData, value: string) => {
    setSchedules(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const handleAdd = () => {
    setSchedules(prev => ([...prev, { mode: 'everyWeek', dayOfWeek: '1', hour: '09', minute: '00' }]));
  };

  const handleRemove = (idx: number) => {
    setSchedules(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-xl w-full mx-auto">
      <div className="p-4 sm:p-8 max-h-[80vh] overflow-y-auto font-outfit bg-white dark:bg-gray-900 rounded-3xl">
        <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">Редактировать расписание запуска</h2>
        <div className="mb-6">
          <span className="text-sm text-gray-500 dark:text-gray-400">Воркфлоу:</span>
          <span className="ml-2 font-semibold text-gray-900 dark:text-white">{workflowName}</span>
        </div>
        
        {/* Актуальное время */}
        <div className="mb-6">
          <div className="flex items-center mb-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Актуальное время</span>
          </div>
          <TimeDisplay />
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        <div className="flex flex-col gap-6 mb-6">
          {schedules.map((schedule, idx) => (
            <div key={idx} className="relative bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-theme-md p-6 flex flex-col md:flex-row items-end gap-4 border-none">
              <div className="flex flex-wrap md:flex-nowrap items-end gap-[6px] flex-1">
                <div className="flex-1 min-w-[120px]">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Частота запуска</label>
                  <select
                    value={schedule.mode}
                    onChange={e => handleChange(idx, 'mode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white appearance-none text-sm"
                  >
                    {MODES.map(mode => (
                      <option key={mode.value} value={mode.value}>{mode.label}</option>
                    ))}
                  </select>
                </div>
                {schedule.mode === 'everyWeek' && (
                  <div className="flex-1 min-w-[120px]">
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">День недели</label>
                    <select
                      value={schedule.dayOfWeek}
                      onChange={e => handleChange(idx, 'dayOfWeek', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white appearance-none text-sm"
                    >
                      {DAYS_OF_WEEK.map(day => (
                        <option key={day.value} value={day.value}>{day.label}</option>
                      ))}
                    </select>
                  </div>
                )}
                {(schedule.mode === 'everyWeek' || schedule.mode === 'everyDay' || schedule.mode === 'everyMonth') && (
                  <div className="min-w-[56px] w-[56px]">
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Часы</label>
                    <input
                      type="number"
                      min="0"
                      max="23"
                      value={schedule.hour}
                      onChange={e => {
                        let val = e.target.value;
                        if (val.length === 1) val = '0' + val;
                        if (parseInt(val) > 23) val = '23';
                        if (parseInt(val) < 0 || val === '') val = '00';
                        handleChange(idx, 'hour', val.padStart(2, '0'));
                      }}
                      className="w-full min-w-[56px] w-[56px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white appearance-none text-sm text-center"
                    />
                  </div>
                )}
                {(schedule.mode === 'everyWeek' || schedule.mode === 'everyDay' || schedule.mode === 'everyMonth' || schedule.mode === 'everyHour') && (
                  <div className="min-w-[56px] w-[56px]">
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Минуты</label>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={schedule.minute}
                      onChange={e => {
                        let val = e.target.value;
                        if (val.length === 1) val = '0' + val;
                        if (parseInt(val) > 59) val = '59';
                        if (parseInt(val) < 0 || val === '') val = '00';
                        handleChange(idx, 'minute', val.padStart(2, '0'));
                      }}
                      className="w-full min-w-[56px] w-[56px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white appearance-none text-sm text-center"
                    />
                  </div>
                )}
              </div>
              {schedules.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="ml-4 w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition self-end"
                  title="Удалить расписание"
                >
                  <TrashBinIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
          <Button
            variant="outline"
            className="px-4 py-2 text-base font-semibold text-blue-500 border-blue-500 hover:bg-blue-50 hover:text-blue-600 focus:ring-2 focus:ring-blue-500 transition"
            onClick={handleAdd}
            startIcon={<span className="text-blue-500">+</span>}
          >
            Добавить расписание
          </Button>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-4 rounded-xl mb-4 mt-8 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                <span>Часовой пояс</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                  New York
                </span>
              </h4>
              <p className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed">
                Все расписания указываются по времени <strong>New York (EST/EDT)</strong>. 
                Для корректной работы учитывайте разницу во времени с вашим регионом.
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap justify-end gap-3 mt-8">
          <Button
            onClick={onClose}
            variant="outline"
            disabled={loading}
            className="px-6 py-2 text-base font-semibold"
          >
            Отмена
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 text-base font-semibold"
          >
            {loading ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}; 