import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { faTelegram } from '@fortawesome/free-brands-svg-icons';
import ReactDOM from 'react-dom';

// Mapping for permissions to Russian names
const PERMISSION_LABELS: Record<string, string> = {
  analysis: 'Анализ',
  development: 'Разработка',
  'team-design': 'Командное проектирование',
  'project-office': 'Проектный офис',
  test: 'Тестовые флоу',
};

export default function UserDropdown() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipTop, setTooltipTop] = useState(0);
  const [showPermissions, setShowPermissions] = useState(false);
  const navigate = useNavigate();

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleSignOut = () => {
    logout();
    closeDropdown();
    navigate('/login');
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center text-gray-700 dropdown-toggle dark:text-gray-400"
      >
        <span className="mr-3 overflow-hidden rounded-full h-11 w-11">
          <img 
            src={user ? "/images/user/minyazev.jpg" : "/images/user/guest.jpg"} 
            alt={user ? user.name : 'Guest'}
          />
        </span>
        <span className="hidden text-right lg:block">
          <span className="block text-sm font-medium text-black dark:text-white">
            {user ? user.name : 'Гость'}
          </span>
        </span>
        <svg
          className={`stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15 7.5L10 12.5L5 7.5"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        <div>
          <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
            {user ? user.name : 'Гость'}
          </span>
          <span className="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
            {user ? user.email : 'Вы находитесь в режиме просмотра'}
          </span>
        </div>
        {/* Разрешения и инфо-кнопка */}
        {user ? (
          <>
            <button
              type="button"
              className="flex items-center w-full gap-2 px-3 py-2 text-gray-600 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300 mt-4 mb-1 relative"
              onClick={() => setShowPermissions((v) => !v)}
              style={{ cursor: 'pointer' }}
            >
              <FontAwesomeIcon 
                icon={faCircleInfo} 
                className={`w-5 h-5 mr-1 ${user.permissions.length > 0 ? 'text-green-500' : 'text-red-500'}`}
              />
              <span>Разрешения</span>
              <svg className={`w-4 h-4 ml-auto transition-transform ${showPermissions ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {showPermissions && (
              <div className="w-full bg-gray-800 text-white text-xs px-3 py-2 rounded-b shadow-lg animate-fade-in">
                {user.permissions.length > 0 ? (
                  <ul className="list-disc ml-4">
                    {user.permissions.map((perm) => (
                      <li key={perm}>{PERMISSION_LABELS[perm] || perm}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="italic text-gray-300">Нет доступа к разделам</div>
                )}
              </div>
            )}
            <ul className="flex flex-col gap-0 pt-1 pb-3 border-b border-gray-200 dark:border-gray-800">
              <li>
                <Link
                  to="https://t.me/mnzev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center w-full gap-2 px-3 py-2 text-gray-600 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                >
                  <FontAwesomeIcon icon={faTelegram} className="w-5 h-5 text-[#229ED9] mr-1" />
                  <span>Написать разработчику</span>
                </Link>
              </li>
            </ul>
          </>
        ) : (
          <>
            <div className="flex items-center w-full gap-2 px-3 py-2 text-gray-400 rounded-lg group text-theme-sm mt-4 mb-1 cursor-not-allowed">
              <FontAwesomeIcon icon={faCircleInfo} className="w-5 h-5 mr-1 text-gray-300" />
              <span>Разрешения</span>
              <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <ul className="flex flex-col gap-0 pt-1 pb-3 border-b border-gray-200 dark:border-gray-800">
              <li>
                <Link
                  to="https://t.me/mnzev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center w-full gap-2 px-3 py-2 text-gray-600 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                >
                  <FontAwesomeIcon icon={faTelegram} className="w-5 h-5 text-[#229ED9] mr-1" />
                  <span>Написать разработчику</span>
                </Link>
              </li>
            </ul>
          </>
        )}
        {user && (
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2 mt-3 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300 w-full"
          >
            <svg
              className="fill-gray-500 group-hover:fill-gray-700 dark:group-hover:fill-gray-300"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.1007 19.247C14.6865 19.247 14.3507 18.9112 14.3507 18.497L14.3507 14.245H12.8507V18.497C12.8507 19.7396 13.8581 20.747 15.1007 20.747H18.5007C19.7434 20.747 20.7507 19.7396 20.7507 18.497L20.7507 5.49609C20.7507 4.25345 19.7433 3.24609 18.5007 3.24609H15.1007C13.8581 3.24609 12.8507 4.25345 12.8507 5.49609V9.74501L14.3507 9.74501V5.49609C14.3507 5.08188 14.6865 4.74609 15.1007 4.74609L18.5007 4.74609C18.9149 4.74609 19.2507 5.08188 19.2507 5.49609L19.2507 18.497C19.2507 18.9112 18.9149 19.247 18.5007 19.247H15.1007ZM3.25073 11.9984C3.25073 12.2144 3.34204 12.4091 3.48817 12.546L8.09483 17.1556C8.38763 17.4485 8.86251 17.4487 9.15549 17.1559C9.44848 16.8631 9.44863 16.3882 9.15583 16.0952L5.81116 12.7484L16.0007 12.7484C16.4149 12.7484 16.7507 12.4127 16.7507 11.9984C16.7507 11.5842 16.4149 11.2484 16.0007 11.2484L5.81528 11.2484L9.15585 7.90554C9.44864 7.61255 9.44847 7.13767 9.15547 6.84488C8.86248 6.55209 8.3876 6.55226 8.09481 6.84525L3.52309 11.4202C3.35673 11.5577 3.25073 11.7657 3.25073 11.9984Z"
                fill=""
              />
            </svg>
            Выход
          </button>
        )}
        {!user && (
          <button
            onClick={() => { if (typeof logout === 'function') logout(); window.location.href = '/login'; }}
            className="flex items-center gap-3 px-3 py-2 mt-3 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300 w-full"
          >
            <svg
              className="fill-gray-500 group-hover:fill-gray-700 dark:group-hover:fill-gray-300"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.1007 19.247C14.6865 19.247 14.3507 18.9112 14.3507 18.497L14.3507 14.245H12.8507V18.497C12.8507 19.7396 13.8581 20.747 15.1007 20.747H18.5007C19.7434 20.747 20.7507 19.7396 20.7507 18.497L20.7507 5.49609C20.7507 4.25345 19.7433 3.24609 18.5007 3.24609H15.1007C13.8581 3.24609 12.8507 4.25345 12.8507 5.49609V9.74501L14.3507 9.74501V5.49609C14.3507 5.08188 14.6865 4.74609 15.1007 4.74609L18.5007 4.74609C18.9149 4.74609 19.2507 5.08188 19.2507 5.49609L19.2507 18.497C19.2507 18.9112 18.9149 19.247 18.5007 19.247H15.1007ZM3.25073 11.9984C3.25073 12.2144 3.34204 12.4091 3.48817 12.546L8.09483 17.1556C8.38763 17.4485 8.86251 17.4487 9.15549 17.1559C9.44848 16.8631 9.44863 16.3882 9.15583 16.0952L5.81116 12.7484L16.0007 12.7484C16.4149 12.7484 16.7507 12.4127 16.7507 11.9984C16.7507 11.5842 16.4149 11.2484 16.0007 11.2484L5.81528 11.2484L9.15585 7.90554C9.44864 7.61255 9.44847 7.13767 9.15547 6.84488C8.86248 6.55209 8.3876 6.55226 8.09481 6.84525L3.52309 11.4202C3.35673 11.5577 3.25073 11.7657 3.25073 11.9984Z"
                fill=""
              />
            </svg>
            Выход
          </button>
        )}
      </Dropdown>
    </div>
  );
}
