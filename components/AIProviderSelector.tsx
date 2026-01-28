import React, { useState, useEffect } from 'react';
import { AIProvider, setAIProvider } from '../services/aiService';
import { Bot, Sparkles, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

interface AIProviderSelectorProps {
  onClose?: () => void;
}

const AIProviderSelector: React.FC<AIProviderSelectorProps> = ({ onClose }) => {
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('gemini');
  const [isConfigured, setIsConfigured] = useState({
    gemini: false,
    openai: false,
    claude: false
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // ============================================================================
  // AUTHENTICATION CHECK (Phase 2: Component Protection)
  // ============================================================================
  useEffect(() => {
    const checkAuth = () => {
      const currentUserId = localStorage.getItem('alshifa_current_user');

      if (!currentUserId) {
        console.warn('🔒 [AIProviderSelector] No authenticated user found');
        toast.error('Please log in to access AI settings');
        if (onClose) {
          onClose();
        }
        setIsAuthenticated(false);
        setIsCheckingAuth(false);
        return;
      }

      setIsAuthenticated(true);
      setIsCheckingAuth(false);
    };

    checkAuth();
  }, [onClose]);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Check which providers are configured
    const stored = localStorage.getItem('alshifa_ai_provider');
    if (stored) {
      setSelectedProvider(stored as AIProvider);
    }

    // Check API key configuration
    setIsConfigured({
      gemini: !!import.meta.env.VITE_GEMINI_API_KEY,
      openai: !!import.meta.env.VITE_OPENAI_API_KEY,
      claude: !!import.meta.env.VITE_ANTHROPIC_API_KEY
    });
  }, [isAuthenticated]);

  const handleProviderChange = (provider: AIProvider) => {
    if (!isConfigured[provider]) {
      toast.error(`${provider} is not configured. Please add API key to .env file.`);
      return;
    }

    setSelectedProvider(provider);
    setAIProvider(provider);
    toast.success(`AI Provider switched to ${provider}`);

    if (onClose) {
      setTimeout(onClose, 500);
    }
  };

  const providers = [
    {
      id: 'openai' as AIProvider,
      name: 'ChatGPT (OpenAI)',
      icon: <Sparkles className="w-6 h-6" />,
      description: 'GPT-4 Turbo - Most advanced reasoning',
      features: ['Best for complex medical analysis', 'Superior language understanding', 'Vision support', 'Voice transcription'],
      color: 'from-green-500 to-emerald-600',
      borderColor: 'border-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      id: 'gemini' as AIProvider,
      name: 'Gemini (Google)',
      icon: <Zap className="w-6 h-6" />,
      description: 'Gemini 1.5 Flash - Fast and efficient',
      features: ['Fastest response time', 'Multimodal capabilities', 'Good multilingual support', 'Cost effective'],
      color: 'from-blue-500 to-cyan-600',
      borderColor: 'border-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      id: 'claude' as AIProvider,
      name: 'Claude (Anthropic)',
      icon: <Bot className="w-6 h-6" />,
      description: 'Claude 3 Sonnet - Balanced and reliable',
      features: ['Excellent for medical documentation', 'Strong safety features', 'Long context window', 'Detailed responses'],
      color: 'from-purple-500 to-pink-600',
      borderColor: 'border-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    }
  ];

  // Don't render if checking auth
  if (isCheckingAuth) {
    return null;
  }

  // Don't render if not authenticated (will close via onClose in useEffect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b dark:border-slate-700 p-6 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                AI Provider Settings
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Choose your preferred AI engine for medical assistance
              </p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="p-6 space-y-4">
          {providers.map((provider) => {
            const isSelected = selectedProvider === provider.id;
            const configured = isConfigured[provider.id];

            return (
              <div
                key={provider.id}
                onClick={() => handleProviderChange(provider.id)}
                className={`
                  relative cursor-pointer border-2 rounded-xl p-6 transition-all
                  ${isSelected
                    ? `${provider.borderColor} ${provider.bgColor} shadow-lg scale-[1.02]`
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }
                  ${!configured && 'opacity-50 cursor-not-allowed'}
                `}
              >
                {/* Status indicator */}
                <div className="absolute top-4 right-4">
                  {configured ? (
                    isSelected ? (
                      <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1 rounded-full border-2 border-green-500">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-xs font-bold text-green-600 dark:text-green-400">ACTIVE</span>
                      </div>
                    ) : (
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                    )
                  ) : (
                    <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-1 rounded-full text-xs font-bold">
                      NOT CONFIGURED
                    </div>
                  )}
                </div>

                <div className="flex items-start gap-4 pr-20">
                  {/* Icon */}
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${provider.color} text-white`}>
                    {provider.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                      {provider.name}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      {provider.description}
                    </p>

                    {/* Features */}
                    <div className="grid grid-cols-2 gap-2">
                      {provider.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                          <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer with info */}
        <div className="border-t dark:border-slate-700 p-6 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
                Important Information
              </h4>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                <li>• All AI responses are for informational purposes only</li>
                <li>• Final medical decisions must be made by licensed physicians</li>
                <li>• Your conversations are encrypted and secure</li>
                <li>• Different providers may give slightly different responses</li>
                <li>• To configure providers, add API keys to your .env.local file</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIProviderSelector;
