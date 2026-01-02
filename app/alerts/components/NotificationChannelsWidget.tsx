export function NotificationChannelsWidget() {
  return (
    <div className="bg-white dark:bg-[#23220f] rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-lg text-neutral-dark dark:text-white">Notification Channels</h3>
        <button className="text-xs font-bold text-primary bg-black px-2 py-1 rounded-md">Edit</button>
      </div>
      <div className="flex flex-col gap-4">
        {/* Channel Item */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
              <span className="material-symbols-outlined text-[20px]">chat</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-neutral-dark dark:text-white">WhatsApp</span>
              <span className="text-xs text-neutral-500">4 Admins</span>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input defaultChecked className="sr-only peer" type="checkbox" value="" />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
        {/* Channel Item */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <span className="material-symbols-outlined text-[20px]">sms</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-neutral-dark dark:text-white">SMS</span>
              <span className="text-xs text-neutral-500">Urgent only</span>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input defaultChecked className="sr-only peer" type="checkbox" value="" />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
        {/* Channel Item */}
        <div className="flex items-center justify-between opacity-60">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400">
              <span className="material-symbols-outlined text-[20px]">mail</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-neutral-dark dark:text-white">Email</span>
              <span className="text-xs text-neutral-500">Weekly Digest</span>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input className="sr-only peer" type="checkbox" value="" />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
      </div>
    </div>
  );
}
