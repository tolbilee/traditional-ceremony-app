'use client';

import { useState } from 'react';
import { ApplicationFormData, Schedule, TimeSlot } from '@/types';
import { TIME_SLOTS } from '@/lib/utils/constants';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ko } from 'date-fns/locale/ko';

interface DateSelectionStepProps {
  formData: Partial<ApplicationFormData>;
  updateFormData: (updates: Partial<ApplicationFormData>) => void;
  onNext: () => void;
}

export default function DateSelectionStep({
  formData,
  updateFormData,
  onNext,
}: DateSelectionStepProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 0, 1)); // 2026년 1월
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showSecondScheduleAlert, setShowSecondScheduleAlert] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<'1' | '2' | null>(null);

  const currentYear = 2026;
  const minDate = new Date(currentYear, 0, 1); // 2026년 1월 1일
  const maxDate = new Date(currentYear, 11, 31); // 2026년 12월 31일

  // 달력의 모든 날짜 생성
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfMonth(currentMonth);
  const calendarEnd = endOfMonth(currentMonth);
  
  // 달력 시작일을 일요일로 맞춤
  const startDate = new Date(calendarStart);
  startDate.setDate(startDate.getDate() - startDate.getDay());
  
  // 달력 종료일을 토요일로 맞춤
  const endDate = new Date(calendarEnd);
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
  
  const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });

  const handleDateClick = (date: Date) => {
    // 2026년 범위 체크
    if (date < minDate || date > maxDate) return;
    
    // 일요일인지 확인
    if (getDay(date) !== 0) {
      alert('일요일만 선택 가능합니다.');
      return;
    }

    setSelectedDate(date);
    setShowPriorityPicker(true);
  };

  const handlePrioritySelect = (priority: '1' | '2') => {
    setSelectedPriority(priority);
    setShowPriorityPicker(false);
    setShowTimePicker(true);
  };

  const handleTimeSelect = (time: TimeSlot) => {
    if (!selectedDate || !selectedPriority) {
      setShowTimePicker(false);
      return;
    }

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const schedule: Schedule = {
      date: dateStr,
      time,
    };

    if (selectedPriority === '1') {
      updateFormData({ schedule1: schedule });
    } else {
      updateFormData({ schedule2: schedule });
    }

    setShowTimePicker(false);
    setSelectedDate(null);
    setSelectedPriority(null);
  };

  const handleNext = () => {
    if (!formData.schedule1?.date) {
      alert('1순위 날짜와 시간을 선택해주세요.');
      return;
    }
    
    if (!formData.schedule2?.date) {
      setShowSecondScheduleAlert(true);
      return;
    }
    
    onNext();
  };

  const schedule1Display = formData.schedule1?.date && formData.schedule1.date !== ''
    ? `2026년 ${format(new Date(formData.schedule1.date), 'M월 d일', { locale: ko })} ${formData.schedule1.time}`
    : '미선택';

  const schedule2Display = formData.schedule2?.date && formData.schedule2.date !== ''
    ? `2026년 ${format(new Date(formData.schedule2.date), 'M월 d일', { locale: ko })} ${formData.schedule2.time}`
    : '미선택';

  const goToPreviousMonth = () => {
    const prevMonth = subMonths(currentMonth, 1);
    // 2026년 1월 이상이면 이동 가능
    if (prevMonth.getFullYear() >= currentYear && prevMonth.getMonth() >= 0) {
      setCurrentMonth(prevMonth);
    }
  };

  const goToNextMonth = () => {
    const nextMonth = addMonths(currentMonth, 1);
    // 2026년 12월 이하이면 이동 가능
    if (nextMonth.getFullYear() <= currentYear && nextMonth.getMonth() <= 11) {
      setCurrentMonth(nextMonth);
    }
  };

  // 이전 달 버튼 비활성화 여부
  const isPrevDisabled = currentMonth.getFullYear() === currentYear && currentMonth.getMonth() === 0;
  
  // 다음 달 버튼 비활성화 여부
  const isNextDisabled = currentMonth.getFullYear() === currentYear && currentMonth.getMonth() === 11;

  const isDateSelected = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return formData.schedule1?.date === dateStr || formData.schedule2?.date === dateStr;
  };

  const isSunday = (date: Date) => getDay(date) === 0;
  const isCurrentMonth = (date: Date) => isSameMonth(date, currentMonth);
  const isInRange = (date: Date) => date >= minDate && date <= maxDate;

  return (
    <div className="space-y-4 pb-24">
      <h2 className="text-xl font-bold text-gray-800">날짜 및 시간 선택</h2>
      <p className="text-sm text-gray-600">2026년 일요일만 선택 가능합니다.</p>

      {/* 선택된 일정 요약 */}
      <div className="rounded-lg bg-blue-50 p-3">
        <div className="space-y-1 text-sm">
          <div>
            <span className="font-semibold">1순위 지정:</span> {schedule1Display}
          </div>
          <div>
            <span className="font-semibold">2순위 지정:</span> {schedule2Display}
          </div>
        </div>
      </div>

      {/* 달력 헤더 */}
      <div className="flex items-center justify-between rounded-lg border-2 border-gray-200 bg-white p-3">
        <button
          onClick={goToPreviousMonth}
          disabled={isPrevDisabled}
          className="rounded-lg px-3 py-1.5 text-xl font-bold text-gray-600 transition-all hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ←
        </button>
        <h3 className="text-lg font-bold text-gray-800">
          {format(currentMonth, 'yyyy년 M월', { locale: ko })}
        </h3>
        <button
          onClick={goToNextMonth}
          disabled={isNextDisabled}
          className="rounded-lg px-3 py-1.5 text-xl font-bold text-gray-600 transition-all hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          →
        </button>
      </div>

      {/* 달력 */}
      <div className="rounded-lg border-2 border-gray-200 bg-white p-3">
        {/* 요일 헤더 */}
        <div className="mb-1 grid grid-cols-7 gap-1">
          {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
            <div
              key={index}
              className="py-1 text-center text-xs font-semibold text-gray-600"
            >
              {day}
            </div>
          ))}
        </div>

        {/* 날짜 그리드 */}
        <div className="grid grid-cols-7 gap-1">
          {daysInMonth.map((date, index) => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const isSun = isSunday(date);
            const isSelected = isDateSelected(date);
            const isCurrent = isCurrentMonth(date);
            const isValid = isInRange(date) && isSun;

            return (
              <button
                key={index}
                onClick={() => handleDateClick(date)}
                disabled={!isValid}
                className={`aspect-square rounded-lg py-1 text-xs font-semibold transition-all ${
                  !isCurrent
                    ? 'text-gray-300'
                    : isValid
                    ? isSelected
                      ? 'bg-green-600 text-white'
                      : 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {format(date, 'd')}
              </button>
            );
          })}
        </div>
      </div>

      {/* 순위 선택 팝업 */}
      {showPriorityPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-6">
            <h3 className="mb-4 text-xl font-bold">순위를 지정해주세요</h3>
            <div className="space-y-3">
              <button
                onClick={() => handlePrioritySelect('1')}
                className="w-full rounded-lg bg-blue-600 px-6 py-4 text-lg font-semibold text-white transition-all hover:bg-blue-700"
              >
                1순위
              </button>
              <button
                onClick={() => handlePrioritySelect('2')}
                className="w-full rounded-lg bg-blue-600 px-6 py-4 text-lg font-semibold text-white transition-all hover:bg-blue-700"
              >
                2순위
              </button>
            </div>
            <button
              onClick={() => {
                setShowPriorityPicker(false);
                setSelectedDate(null);
              }}
              className="mt-4 w-full rounded-lg bg-gray-200 py-3 font-semibold text-gray-700"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* 시간 선택 팝업 */}
      {showTimePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-6">
            <h3 className="mb-4 text-xl font-bold">예식 시간을 선택해주세요</h3>
            <div className="space-y-3">
              {TIME_SLOTS.map((time) => (
                <button
                  key={time}
                  onClick={() => handleTimeSelect(time as TimeSlot)}
                  className="w-full rounded-lg bg-blue-600 px-6 py-4 text-lg font-semibold text-white transition-all hover:bg-blue-700"
                >
                  {time}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setShowTimePicker(false);
                setSelectedDate(null);
                setSelectedPriority(null);
              }}
              className="mt-4 w-full rounded-lg bg-gray-200 py-3 font-semibold text-gray-700"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* 2순위 날짜 지정 요청 팝업 */}
      {showSecondScheduleAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-6">
            <h3 className="mb-4 text-xl font-bold">2순위 날짜를 지정해주세요</h3>
            <button
              onClick={() => setShowSecondScheduleAlert(false)}
              className="mt-4 w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition-all hover:bg-blue-700"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* 다음 버튼 */}
      <div className="flex justify-end pt-4 pb-24">
        <button
          onClick={handleNext}
          className="rounded-full bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-blue-700 active:scale-95"
        >
          다음 단계
        </button>
      </div>
    </div>
  );
}

