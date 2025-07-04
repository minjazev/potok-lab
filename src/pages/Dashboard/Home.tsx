import { useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import * as Icons from '../../icons';

export default function Home() {
  useEffect(() => {
    // Function to update state from localStorage
    const updateMetrics = () => {
      // Get login count
      // const storedLoginCount = localStorage.getItem('login_count');
      // Get auth count
      // const storedUser = localStorage.getItem('user');
    };

    // Initial update
    updateMetrics();

    // Listen for changes in localStorage
    window.addEventListener('storage', updateMetrics);

    // Cleanup listener
    return () => {
      window.removeEventListener('storage', updateMetrics);
    };
  }, []);

  return (
    <>
      <PageMeta
        title="Что нового — Potok.Lab"
        description="Последние обновления, новости, планы и вдохновение для вашей команды."
      />
      <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-10">
        {/* Хедлайн */}
        <div className="rounded-2xl bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-400 dark:from-blue-800 dark:via-sky-900 dark:to-cyan-900 p-8 shadow-xl flex flex-col md:flex-row items-center gap-6 text-white">
          <Icons.ShootingStarIcon className="w-14 h-14 flex-shrink-0 drop-shadow-lg" />
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Добро пожаловать в обновлённый Potok.Lab!</h1>
            <p className="text-lg opacity-90">Здесь вы всегда найдёте свежие новости, важные апдейты и планы развития платформы.</p>
          </div>
        </div>

        {/* Лента новостей */}
        <div className="flex flex-col gap-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Последние новости</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Новость 1: Аналитика и логи */}
            <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 flex gap-4 items-start shadow-sm hover:shadow-md transition">
              <Icons.PieChartIcon className="w-8 h-8 text-green-500 dark:text-green-300 mt-1" />
              <div>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">Аналитика и логи</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-2">Добавлена страница логов с фильтрацией по действиям, современным дизайном и поддержкой тёмной темы.</p>
                <span className="inline-block bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 text-xs px-2 py-0.5 rounded">июль 2025</span>
              </div>
            </div>
            {/* Новость 2: Командная работа */}
            <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 flex gap-4 items-start shadow-sm hover:shadow-md transition">
              <Icons.GroupIcon className="w-8 h-8 text-purple-500 dark:text-purple-300 mt-1" />
              <div>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">Командная работа</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-2">Улучшено управление доступом, добавлены роли и новые возможности для совместной работы.</p>
                <span className="inline-block bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 text-xs px-2 py-0.5 rounded">июнь 2025</span>
              </div>
            </div>
            {/* Новость 3: Скорость и стабильность */}
            <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 flex gap-4 items-start shadow-sm hover:shadow-md transition">
              <Icons.BoltIcon className="w-8 h-8 text-yellow-500 dark:text-yellow-300 mt-1" />
              <div>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">Скорость и стабильность</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-2">Платформа стала быстрее: оптимизированы загрузка данных, переходы между страницами и работа с воркфлоу.</p>
                <span className="inline-block bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200 text-xs px-2 py-0.5 rounded">июнь 2025</span>
              </div>
            </div>
            {/* Новость 4: Интеграция с внешними сервисами */}
            <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 flex gap-4 items-start shadow-sm hover:shadow-md transition">
              <Icons.PlugInIcon className="w-8 h-8 text-blue-500 dark:text-blue-400 mt-1" />
              <div>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">Интеграция с внешними сервисами</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-2">В веб-приложении теперь доступна интеграция с n8n — это первый шаг. Впереди нас ждёт расширение возможностей и поддержка других инструментов.</p>
                <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-xs px-2 py-0.5 rounded">июнь 2025</span>
              </div>
            </div>
          </div>
        </div>

        {/* Changelog */}
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Changelog</h2>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-gray-700 dark:text-gray-300"><Icons.CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5" /> Улучшена адаптация под тёмную тему на всех страницах</li>
            <li className="flex items-start gap-2 text-gray-700 dark:text-gray-300"><Icons.CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5" /> Добавлена галерея всех SVG-иконок</li>
            <li className="flex items-start gap-2 text-gray-700 dark:text-gray-300"><Icons.CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5" /> Современная страница логов с фильтрацией и зеброй</li>
            <li className="flex items-start gap-2 text-gray-700 dark:text-gray-300"><Icons.CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5" /> Новые роли и улучшенное управление доступом</li>
            <li className="flex items-start gap-2 text-gray-700 dark:text-gray-300"><Icons.CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5" /> Оптимизация скорости загрузки и переходов</li>
          </ul>
        </div>

        {/* Вдохновляющие цитаты */}
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Вдохновляющие цитаты</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <blockquote className="rounded-xl bg-gradient-to-br from-pink-100 via-pink-50 to-white dark:from-pink-900 dark:via-gray-900 dark:to-gray-800 p-6 shadow flex flex-col gap-2">
              <span className="text-lg font-medium text-pink-700 dark:text-pink-200">“Лучшее время посадить дерево было 20 лет назад. Второе лучшее время — сегодня.”</span>
              <span className="text-xs text-pink-500 dark:text-pink-300">— Китайская пословица</span>
            </blockquote>
            <blockquote className="rounded-xl bg-gradient-to-br from-blue-100 via-blue-50 to-white dark:from-blue-900 dark:via-gray-900 dark:to-gray-800 p-6 shadow flex flex-col gap-2">
              <span className="text-lg font-medium text-blue-700 dark:text-blue-200">“Вдохновение существует, но оно должно застать тебя за работой.”</span>
              <span className="text-xs text-blue-500 dark:text-blue-300">— Пабло Пикассо</span>
            </blockquote>
          </div>
        </div>

        {/* Roadmap */}
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Что дальше?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-5 flex flex-col gap-2 shadow-sm">
              <Icons.PaperPlaneIcon className="w-7 h-7 text-sky-500 dark:text-sky-300 mb-1" />
              <span className="font-semibold text-gray-900 dark:text-white">Push-уведомления</span>
              <span className="text-gray-600 dark:text-gray-300 text-sm">Оповещения о важных событиях прямо в браузер.</span>
            </div>
            <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-5 flex flex-col gap-2 shadow-sm">
              <Icons.TableIcon className="w-7 h-7 text-emerald-500 dark:text-emerald-300 mb-1" />
              <span className="font-semibold text-gray-900 dark:text-white">Гибкие отчёты</span>
              <span className="text-gray-600 dark:text-gray-300 text-sm">Конструктор кастомных отчётов для аналитики процессов.</span>
            </div>
            <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-5 flex flex-col gap-2 shadow-sm">
              <Icons.UserCircleIcon className="w-7 h-7 text-fuchsia-500 dark:text-fuchsia-300 mb-1" />
              <span className="font-semibold text-gray-900 dark:text-white">Профили пользователей</span>
              <span className="text-gray-600 dark:text-gray-300 text-sm">Больше информации и настроек для каждого участника команды.</span>
            </div>
          </div>
        </div>

        {/* Футер с обратной связью */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-10">
          Есть идеи или хотите поделиться обратной связью? <a href="mailto:team@potok.io" className="underline hover:text-blue-600 dark:hover:text-blue-400">Напишите нам</a>!
        </div>
      </div>
    </>
  );
}
