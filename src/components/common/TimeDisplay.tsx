import React, { useState, useEffect } from 'react';

interface TimeDisplayProps {
  className?: string;
}

interface TimeInfo {
  time: string;
  date: string;
  timezone: string;
  offset: string;
  label: string;
  color: string;
  bg: string;
  border: string;
}

export const TimeDisplay: React.FC<TimeDisplayProps> = ({ className = '' }) => {
  const [currentTime, setCurrentTime] = useState<{
    ny: TimeInfo;
    moscow: TimeInfo;
    ekat: TimeInfo;
  }>({
    ny: { time: '', date: '', timezone: 'America/New_York', offset: '', label: 'NY (EDT)', color: 'blue', bg: 'from-blue-50 to-indigo-50', border: 'border-blue-100 dark:border-blue-800' },
    moscow: { time: '', date: '', timezone: 'Europe/Moscow', offset: '', label: 'MSK (GMT+3)', color: 'red', bg: 'from-red-50 to-orange-50', border: 'border-red-100 dark:border-red-800' },
    ekat: { time: '', date: '', timezone: 'Asia/Yekaterinburg', offset: '', label: 'EKAT (GMT+5)', color: 'emerald', bg: 'from-emerald-50 to-lime-50', border: 'border-emerald-100 dark:border-emerald-800' }
  });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // NY Time
      const nyTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
      const nyOffset = now.toLocaleString('en-US', { timeZone: 'America/New_York', timeZoneName: 'short' }).split(' ').pop() || 'EDT';
      // Moscow Time
      const moscowTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Moscow' }));
      const moscowOffset = now.toLocaleString('en-US', { timeZone: 'Europe/Moscow', timeZoneName: 'short' }).split(' ').pop() || 'GMT+3';
      // Ekaterinburg Time
      const ekatTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Yekaterinburg' }));
      const ekatOffset = now.toLocaleString('en-US', { timeZone: 'Asia/Yekaterinburg', timeZoneName: 'short' }).split(' ').pop() || 'GMT+5';

      setCurrentTime({
        ny: {
          time: nyTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          date: nyTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          timezone: 'America/New_York',
          offset: nyOffset,
          label: 'NY (EDT)',
          color: 'blue',
          bg: 'from-blue-50 to-indigo-50',
          border: 'border-blue-100 dark:border-blue-800',
        },
        moscow: {
          time: moscowTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          date: moscowTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          timezone: 'Europe/Moscow',
          offset: moscowOffset,
          label: 'MSK (GMT+3)',
          color: 'red',
          bg: 'from-red-50 to-orange-50',
          border: 'border-red-100 dark:border-red-800',
        },
        ekat: {
          time: ekatTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          date: ekatTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          timezone: 'Asia/Yekaterinburg',
          offset: ekatOffset,
          label: 'EKAT (GMT+5)',
          color: 'emerald',
          bg: 'from-emerald-50 to-lime-50',
          border: 'border-emerald-100 dark:border-emerald-800',
        },
      });
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const colorMap = {
    blue: 'bg-blue-500 text-blue-700 dark:text-blue-300',
    red: 'bg-red-500 text-red-700 dark:text-red-300',
    emerald: 'bg-emerald-500 text-emerald-700 dark:text-emerald-300',
  };

  return (
    <div className={`flex items-stretch gap-3 w-full ${className}`}>
      {[currentTime.ny, currentTime.moscow, currentTime.ekat].map((zone, idx) => (
        <div
          key={zone.label}
          className={`flex-1 flex flex-col justify-between px-3 py-2 rounded-xl border ${zone.border} bg-gradient-to-r ${zone.bg} min-w-0`}
          style={{ minWidth: 0 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-2 h-2 rounded-full animate-pulse ${colorMap[zone.color as keyof typeof colorMap].split(' ')[0]}`}></div>
            <span className={`text-xs font-medium ${colorMap[zone.color as keyof typeof colorMap].split(' ')[1]} dark:${colorMap[zone.color as keyof typeof colorMap].split(' ')[2]}`}>{zone.label}</span>
          </div>
          <div className="text-right">
            <div className={`text-base font-mono font-semibold ${colorMap[zone.color as keyof typeof colorMap].split(' ')[1]} dark:${colorMap[zone.color as keyof typeof colorMap].split(' ')[2]}`}>{zone.time}</div>
            <div className={`text-xs ${colorMap[zone.color as keyof typeof colorMap].split(' ')[1]} dark:${colorMap[zone.color as keyof typeof colorMap].split(' ')[2]}`}>{zone.date} {zone.offset}</div>
          </div>
        </div>
      ))}
    </div>
  );
}; 