import { useState } from "react";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { useNavigate } from "react-router-dom";
import { n8nService } from "../../services/n8nService";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [n8nToken, setN8nToken] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      localStorage.setItem("n8n_authenticated_token", n8nToken);
      await n8nService.getWorkflows();
      localStorage.setItem("n8n_authenticated", "true");

      // Increment login count
      const currentCount = parseInt(localStorage.getItem('login_count') || '0', 10);
      localStorage.setItem('login_count', (currentCount + 1).toString());
      
      navigate("/");
    } catch (error) {
      localStorage.removeItem("n8n_authenticated_token");
      localStorage.removeItem("n8n_authenticated");
      setError('Ключ не подошёл. Проверь буквы — возможно, ты случайно вызвал демона, а нам нужен просто правильный ключ доступа.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="w-full max-w-md pt-10 mx-auto"></div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-4 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Привет, коллега 👋
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Ты на пороге автоматизации.<br/>
              Введи ключ и почувствуй себя повелителем уведомлений.
            </p>
          </div>
          <form onSubmit={handleSignIn}>
            <div className="space-y-6">
              <div>
                <Label>
                  Пароль <span className="text-error-500">*</span>{" "}
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Введите секретный ключ"
                    value={n8nToken}
                    onChange={(e) => setN8nToken(e.target.value)}
                    error={!!error}
                    className="pr-12"
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                  >
                    {showPassword ? (
                      <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    ) : (
                      <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    )}
                  </span>
                </div>
                {error && (
                  <p className="mt-2 text-sm text-error-500">{error}</p>
                )}
              </div>
              <div>
                <Button 
                  type="submit"
                  className={`w-full relative overflow-hidden ${isLoading ? 'loading-gradient' : '!bg-[#6A22F1]'}`}
                  size="sm"
                  disabled={isLoading}
                >
                  <div className="relative z-10">
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <span className="mr-2">Проверка</span>
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.15s] mx-1"></div>
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                      </div>
                    ) : 'Авторизоваться'}
                  </div>
                </Button>
              </div>
            </div>
          </form>
          <div className="relative py-3 sm:py-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="p-2 text-gray-400 bg-white dark:bg-gray-900 sm:px-5 sm:py-2">
                  Potok.Lab
                </span>
              </div>
            </div>
            <div className="mt-5 text-center">
              <p className="text-sm">
                <span className="text-gray-500 dark:text-gray-400">Нет ключа?</span>{" "}
                <a
                  href="https://t.me/mnzev"
                  className="text-[#6A22F1] hover:text-[#6A22F1]/80"
                >
                  Напиши мне
                </a>
              </p>
            </div>
            <div className="mt-[105px] text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Made with 🤎 by Arthur Minjazev
              </p>
            </div>
        </div>
      </div>
    </div>
  );
} 