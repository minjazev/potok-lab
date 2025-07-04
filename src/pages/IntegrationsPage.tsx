import React, { useState } from "react";

// Assume an icon for N8N would be imported here, e.g., N8NIcon
// For now, I'll use a placeholder or a generic icon if available

const IntegrationsPage: React.FC = () => {
  const [isN8NConnected, setIsN8NConnected] = useState(true);

  const toggleN8NConnection = () => {
    setIsN8NConnected(!isN8NConnected);
  };

  return (
    <>
      <div className="flex flex-col gap-10">
        <div className="rounded-2xl border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-gray-700 dark:bg-gray-800 sm:px-7.5 xl:pb-1">
          <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
            Интеграции и подключённые сервисы
          </h4>
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            Когда-нибудь здесь появится всё для подключения любимых инструментов. Ну а пока только N8N
          </p>

          <div className="flex flex-col gap-5.5 p-6.5 w-full">
            {/* N8N Integration Card */}
            <div className="rounded-2xl border border-stroke bg-white/50 dark:border-gray-700 dark:bg-gray-800/50 backdrop-blur-sm px-8 py-6 flex items-center justify-between transition-all duration-300 w-full">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center p-3 transition-all duration-300">
                  <img src="/images/integrations/n8n-logo.svg" alt="N8N Logo" className="w-8 h-8 transition-transform duration-300" />
                </div>
                <div>
                  <h5 className="font-bold text-lg text-black dark:text-white">N8N</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Automate your workflows with powerful nodes.
                  </p>
                </div>
              </div>
              <div className="mt-4 lg:mt-0 flex items-center gap-4">
                {/* Status Badge */}
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    isN8NConnected
                      ? "bg-success-100 text-success-800 dark:bg-success-500/15 dark:text-success-500"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                  }`}
                >
                  {isN8NConnected ? "Активна интеграция" : "Не активна интеграция"}
                </span>

                {/* Toggle Switch */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    value=""
                    className="sr-only peer"
                    checked={isN8NConnected}
                    onChange={toggleN8NConnection}
                    disabled
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default IntegrationsPage; 