import toast from 'react-hot-toast';

export const notifyLiveEvent = (inviterName, inviterPic, title, subtitle) => {
  toast.custom((t) => (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-white shadow-xl rounded-lg pointer-events-auto flex ring-1 ring-black/5 transition-all duration-300`}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          
          <div className="shrink-0 pt-0.5">
            {inviterPic ? (
              <img
                className="h-10 w-10 rounded-full object-cover border border-gray-100"
                src={inviterPic}
                alt={inviterName}
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold shadow-sm">
                {inviterName?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
          </div>
          
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">
              {inviterName}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {title}
            </p>
            <p className="mt-0.5 text-xs text-blue-600 font-medium">
              {subtitle}
            </p>
          </div>

        </div>
      </div>
      
      <div className="flex border-l border-gray-100">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 focus:outline-none transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  ), { 
    duration: 5000, 
    position: 'bottom-right' 
  });
};