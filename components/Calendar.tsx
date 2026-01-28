
import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { uiStrings } from '../constants';

interface CalendarProps {
  events: string[];
  onDateClick: (date: string) => void;
  selectedDate: string | null;
}

const Calendar: React.FC<CalendarProps> = ({ events, onDateClick, selectedDate }) => {
  const { language } = useLanguage();
  const strings = uiStrings[language];
  const [currentDate, setCurrentDate] = useState(new Date());

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const renderHeader = () => {
    const monthNames = (strings.calendarMonths as string[]) || [];
    const monthName = monthNames[currentDate.getMonth()] || '';
    const year = currentDate.getFullYear();
    return (
      <div className="flex justify-between items-center mb-4">
        <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          &lt;
        </button>
        <h3 className="text-lg font-semibold">{monthName} {year}</h3>
        <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          &gt;
        </button>
      </div>
    );
  };

  const renderDays = () => {
    const dayNames = (strings.calendarDays as string[]) || [];
    return (
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-500 dark:text-slate-400">
        {dayNames.map(day => (
          <div key={day} className="py-2">{day}</div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    const cells = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      cells.push(<div key={`empty-${i}`} className="p-1"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const fullDate = new Date(year, month, day);
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
        const hasEvent = (events || []).includes(dateString);
        const isSelected = selectedDate === dateString;

        const cellClasses = `
            relative flex items-center justify-center h-9 w-9 rounded-full cursor-pointer transition-colors text-sm
            ${isSelected ? 'bg-cyan-600 text-white' : ''}
            ${!isSelected && isToday ? 'bg-cyan-100 dark:bg-cyan-900' : ''}
            ${!isSelected ? 'hover:bg-slate-200 dark:hover:bg-slate-700' : ''}
        `;

      cells.push(
        <div key={day} className={cellClasses} onClick={() => onDateClick(dateString)}>
          <span>{day}</span>
          {hasEvent && !isSelected && <div className="absolute bottom-1 h-1 w-1 bg-emerald-500 rounded-full"></div>}
        </div>
      );
    }

    return <div className="grid grid-cols-7 gap-1">{cells}</div>;
  };

  return (
    <div>
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
};

export default Calendar;
