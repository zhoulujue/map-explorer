import { useState, useEffect } from 'react';
import { useTheme } from '@/hooks/useTheme';

interface OperatingHoursProps {
  hours?: Array<{
    open: Array<{
      day: number;
      start: string;
      end: string;
    }>;
  }>;
}

const DAYS_OF_WEEK = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

export default function OperatingHours({ hours }: OperatingHoursProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [currentHours, setCurrentHours] = useState<{ start: string; end: string } | null>(null);
  const { isDark } = useTheme();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!hours || hours.length === 0) return;

    const now = currentTime;
    const currentDay = now.getDay();
    const currentTimeStr = now.toTimeString().slice(0, 5).replace(':', '');

    const todayHours = hours[0]?.open.filter(period => period.day === currentDay) || [];
    
    let open = false;

    for (const period of todayHours) {
      const startTime = period.start;
      const endTime = period.end;
      
      if (currentTimeStr >= startTime && currentTimeStr <= endTime) {
        open = true;
        setCurrentHours({ start: startTime, end: endTime });
        break;
      }
    }

    setIsOpen(open);
    if (!open && todayHours.length > 0) {
      const nextOpen = todayHours[0];
      setCurrentHours({ start: nextOpen.start, end: nextOpen.end });
    }
  }, [currentTime, hours]);

  const formatTime = (time: string) => {
    return `${time.slice(0, 2)}:${time.slice(2, 4)}`;
  };

  if (!hours || hours.length === 0) {
    return (
      <div className={`${isDark ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg p-4`}>
        <p className="text-text-secondary text-sm">营业时间信息暂缺</p>
      </div>
    );
  }

  return (
    <div className={`${isDark ? 'bg-card border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-4`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-text">营业时间</h3>
        <div className={`flex items-center space-x-2 ${isOpen ? 'text-green-500' : 'text-red-500'}`}>
          <div className={`w-2 h-2 rounded-full ${isOpen ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm font-medium">
            {isOpen ? '营业中' : '已打烊'}
          </span>
        </div>
      </div>

      {currentHours && (
        <div className={`mb-3 p-3 ${isDark ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg`}>
          <p className="text-sm text-text-secondary">
            今日: {formatTime(currentHours.start)} - {formatTime(currentHours.end)}
          </p>
        </div>
      )}

      <div className="space-y-2">
        {DAYS_OF_WEEK.map((day, index) => {
          const dayHours = hours[0]?.open.filter(period => period.day === index) || [];
          
          return (
            <div key={day} className="flex justify-between items-center text-sm">
              <span className="text-text-secondary font-medium">{day}</span>
              <span className="text-text">
                {dayHours.length > 0 ? (
                  dayHours.map((period, idx) => (
                    <span key={idx}>
                      {formatTime(period.start)} - {formatTime(period.end)}
                      {idx < dayHours.length - 1 && ', '}
                    </span>
                  ))
                ) : (
                  '休息'
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
