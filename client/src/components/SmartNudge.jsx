import React from 'react';
import { AlertCircle, ArrowRight, TrendingUp, Calendar, Smile } from 'lucide-react';
import { differenceInCalendarDays, parseISO, isPast, isToday } from 'date-fns';

const SmartNudge = ({ assignments }) => {
  if (!assignments || assignments.length === 0) return null;

  // 1. FILTER FIRST: Ignore 'Done' tasks and 'Overdue' tasks
  const activeTasks = assignments.filter(task => {
    const isDone = task.status === 'Done';
    
    // Check if task is strictly in the past (yesterday or older)
    // We keep 'Today' as valid.
    const date = parseISO(task.dueDate);
    const isExpired = isPast(date) && !isToday(date); 

    return !isDone && !isExpired;
  });

  // If no active tasks left after filtering, show "Chill" state immediately
  if (activeTasks.length === 0) {
     return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-start gap-4">
        <div className="bg-green-100 p-2 rounded-full text-green-600">
           <Smile size={24} />
        </div>
        <div>
          <h3 className="font-bold text-green-800">All caught up!</h3>
          <p className="text-sm text-green-700">You have no urgent deadlines. This is a great time to review your notes or take a break. 🌱</p>
        </div>
      </div>
    );
  }

  // 2. Helper to calculate WSJF Score
  const calculateScore = (task) => {
    const now = new Date();
    const due = new Date(task.dueDate);
    
    // Use differenceInCalendarDays for accurate "0 days" if due today
    const daysLeft = Math.max(0, differenceInCalendarDays(due, now));
    
    if (daysLeft === 0) return 100; // Super urgent (Due Today)

    return (task.weight / daysLeft) * 10;
  };

  // 3. Find the "Critical Task" from the FILTERED list
  const criticalTask = activeTasks
    .map(t => ({ ...t, score: calculateScore(t) }))
    .sort((a, b) => b.score - a.score)[0];

  // 4. Define Thresholds
  const isUrgent = criticalTask.score > 10;
  const daysRemaining = differenceInCalendarDays(parseISO(criticalTask.dueDate), new Date());

  // If the highest priority task isn't urgent (e.g. far away), show chill message
  if (!isUrgent && daysRemaining > 3) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-start gap-4">
        <div className="bg-green-100 p-2 rounded-full text-green-600">
           <Smile size={24} />
        </div>
        <div>
          <h3 className="font-bold text-green-800">No urgent fires to put out.</h3>
          <p className="text-sm text-green-700">Your next deadline is in {daysRemaining} days. You are ahead of schedule!</p>
        </div>
      </div>
    );
  }

  // 5. Render the Urgent Nudge
  return (
    <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 md:p-4 mb-8 shadow-sm relative overflow-hidden">
      <div className="hidden md:block absolute top-0 right-0 w-32 h-32 bg-orange-100 rounded-full -mr-16 -mt-16 opacity-50"></div>

      <div className="relative z-10 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        
        <div className="flex items-start gap-3 md:gap-4 flex-1">
          <div className="bg-orange-100 p-2 rounded-lg text-orange-600 shrink-0">
             <TrendingUp size={22} />
          </div>
          
          <div className="flex-1">
            <h3 className="font-bold text-orange-900 text-base md:text-lg flex items-center gap-2">
              Focus Recommendation
              <span className="text-xs bg-orange-200 text-orange-800 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">High Priority</span>
            </h3>
            
            <p className="text-orange-800 mt-1 max-w-full md:max-w-xl text-sm leading-relaxed">
              Based on deadlines & weight, focus on <span className="font-bold">"{criticalTask.title}"</span> ({criticalTask.courseName}).
            </p>
            
            <div className="flex flex-col md:flex-row gap-2 md:gap-4 mt-3 text-xs font-semibold text-orange-700">
               <div className="flex items-center gap-1">
                 <Calendar size={14} /> 
                 {daysRemaining <= 0 ? "Due Today!" : `Due in ${daysRemaining} days`}
               </div>
               <div className="flex items-center gap-1">
                 <AlertCircle size={14} /> 
                 {criticalTask.weight}% Weight
               </div>
            </div>
          </div>
        </div>

        <button className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors shadow-sm whitespace-nowrap w-full md:w-auto mt-3 md:mt-0 justify-center">
          Start Task <ArrowRight size={16} />
        </button>

      </div>
    </div>
  );
};

export default SmartNudge;