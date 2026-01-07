import React from 'react';
import { AlertCircle, ArrowRight, TrendingUp, Calendar } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';

const SmartNudge = ({ assignments }) => {
  if (!assignments || assignments.length === 0) return null;

  // 1. Helper to calculate WSJF Score (Same logic as Dashboard)
  const calculateScore = (task) => {
    const now = new Date();
    const due = new Date(task.dueDate);
    const daysLeft = Math.max(0, differenceInDays(due, now)); // Avoid division by zero
    
    // Safety check for overdue
    if (daysLeft === 0) return 100; 

    // WSJF Logic: (Value / Time)
    // We multiply by 10 just to make the numbers look nicer
    return (task.weight / daysLeft) * 10;
  };

  // 2. Find the "Critical Task"
  const criticalTask = assignments
    .map(t => ({ ...t, score: calculateScore(t) }))
    .sort((a, b) => b.score - a.score)[0]; // Get the one with highest score

  // 3. Define Thresholds for a "Nudge"
  // Only show if score is high (> 10) or due very soon (< 3 days)
  const isUrgent = criticalTask.score > 10;
  const daysRemaining = differenceInDays(parseISO(criticalTask.dueDate), new Date());

  if (!isUrgent && daysRemaining > 3) {
    // If nothing is urgent, show a "Chill" message
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

  // 4. Render the Urgent Nudge
  return (
    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-8 shadow-sm relative overflow-hidden">
      {/* Decorative Background Element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 rounded-full -mr-16 -mt-16 opacity-50"></div>

      <div className="relative z-10 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        
        <div className="flex items-start gap-4">
          <div className="bg-orange-100 p-2.5 rounded-lg text-orange-600 shrink-0">
             <TrendingUp size={24} />
          </div>
          
          <div>
            <h3 className="font-bold text-orange-900 text-lg flex items-center gap-2">
              Focus Recommendation
              <span className="text-xs bg-orange-200 text-orange-800 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">High Priority</span>
            </h3>
            
            <p className="text-orange-800 mt-1 max-w-xl text-sm leading-relaxed">
              Based on your deadlines and grade weight, you should focus on <span className="font-bold">"{criticalTask.title}"</span> ({criticalTask.courseName}).
            </p>
            
            <div className="flex gap-4 mt-3 text-xs font-semibold text-orange-700">
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

        {/* Action Button */}
        <button className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors shadow-sm whitespace-nowrap">
          Start Task <ArrowRight size={16} />
        </button>

      </div>
    </div>
  );
};

// Simple Smile Icon for the "Chill" state
const Smile = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
);

export default SmartNudge;