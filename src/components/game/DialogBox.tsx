import React, { useState, useEffect } from 'react';
import { useGameDialog } from '../../store/gameStore';

export const DialogBox: React.FC = () => {
  const { currentDialog, hideDialog } = useGameDialog();
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    if (!currentDialog) {
      setDisplayedText('');
      setIsTyping(false);
      setShowOptions(false);
      return;
    }

    // Reset state for new dialog
    setDisplayedText('');
    setIsTyping(true);
    setShowOptions(false);

    // Type out the text
    const text = currentDialog.text;
    let currentIndex = 0;

    const typeInterval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.substring(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsTyping(false);
        setShowOptions(true);
        clearInterval(typeInterval);
      }
    }, 30); // Typing speed: 30ms per character

    return () => clearInterval(typeInterval);
  }, [currentDialog]);

  const handleOptionClick = (option: { text: string; action: string }) => {
    // Handle the action - this could trigger different game events
    console.log('Dialog option selected:', option.action);

    // For now, just close the dialog
    // In a real game, you'd want to handle different actions
    switch (option.action) {
      case 'close':
      case 'continue':
        hideDialog();
        break;
      case 'shop':
        // Open shop
        hideDialog();
        break;
      case 'tutorial':
        // Start tutorial
        hideDialog();
        break;
      default:
        hideDialog();
    }
  };

  const handleSkipTyping = () => {
    if (isTyping) {
      setDisplayedText(currentDialog?.text || '');
      setIsTyping(false);
      setShowOptions(true);
    }
  };

  const handleContinue = () => {
    if (!isTyping) {
      hideDialog();
    }
  };

  if (!currentDialog) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-end justify-center pb-8">
      <div className="w-full max-w-4xl mx-4">
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-xl border border-gray-600 overflow-hidden shadow-2xl">
          {/* Character name bar */}
          <div className="bg-gradient-to-r from-blue-900 to-purple-900 px-6 py-3 border-b border-gray-600">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {currentDialog.character.charAt(0).toUpperCase()}
                </span>
              </div>
              <h3 className="text-white font-semibold text-lg">{currentDialog.character}</h3>
            </div>
          </div>

          {/* Dialog content */}
          <div className="p-6">
            <div
              className="text-white text-lg leading-relaxed min-h-[80px] cursor-pointer"
              onClick={handleSkipTyping}
            >
              {displayedText}
              {isTyping && (
                <span className="inline-block w-2 h-6 bg-white ml-1 animate-pulse" />
              )}
            </div>

            {/* Options or continue button */}
            <div className="mt-6 flex justify-end">
              {showOptions ? (
                currentDialog.options && currentDialog.options.length > 0 ? (
                  // Multiple choice options
                  <div className="space-y-2 w-full">
                    {currentDialog.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleOptionClick(option)}
                        className="w-full p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-left border border-gray-600 hover:border-gray-500"
                      >
                        <span className="text-blue-400 mr-2">▶</span>
                        {option.text}
                      </button>
                    ))}
                  </div>
                ) : (
                  // Simple continue button
                  <button
                    onClick={handleContinue}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
                  >
                    <span>Continue</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )
              ) : (
                // Skip typing hint
                <div className="text-gray-400 text-sm">
                  Click to skip typing...
                </div>
              )}
            </div>
          </div>

          {/* Keyboard hints */}
          <div className="bg-gray-800 px-6 py-2 border-t border-gray-600">
            <div className="flex justify-between items-center text-xs text-gray-400">
              <div>
                {isTyping ? 'Click to skip' : 'Press SPACE or click Continue'}
              </div>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-1">
                  <kbd className="bg-gray-700 px-2 py-1 rounded text-xs">SPACE</kbd>
                  <span>Continue</span>
                </div>
                <div className="flex items-center space-x-1">
                  <kbd className="bg-gray-700 px-2 py-1 rounded text-xs">ESC</kbd>
                  <span>Close</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Advanced dialog box with more features
export const AdvancedDialogBox: React.FC<{
  character: string;
  portrait?: string;
  text: string;
  options?: { text: string; action: string; condition?: () => boolean }[];
  onClose: () => void;
  onAction?: (action: string) => void;
  typewriterSpeed?: number;
  allowSkip?: boolean;
  showPortrait?: boolean;
}> = ({
  character,
  portrait,
  text,
  options = [],
  onClose,
  onAction,
  typewriterSpeed = 30,
  allowSkip = true,
  showPortrait = true
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    setDisplayedText('');
    setIsTyping(true);
    setShowOptions(false);

    let currentIndex = 0;
    const typeInterval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.substring(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsTyping(false);
        setShowOptions(true);
        clearInterval(typeInterval);
      }
    }, typewriterSpeed);

    return () => clearInterval(typeInterval);
  }, [text, typewriterSpeed]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key) {
        case ' ':
        case 'Enter':
          if (isTyping && allowSkip) {
            setDisplayedText(text);
            setIsTyping(false);
            setShowOptions(true);
          } else if (!isTyping) {
            if (options.length === 0) {
              onClose();
            }
          }
          break;
        case 'Escape':
          onClose();
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
          if (showOptions && options.length > 0) {
            const optionIndex = parseInt(event.key) - 1;
            if (optionIndex >= 0 && optionIndex < options.length) {
              const option = options[optionIndex];
              if (!option.condition || option.condition()) {
                handleOptionClick(option);
              }
            }
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isTyping, showOptions, options, allowSkip, text, onClose]);

  const handleSkipTyping = () => {
    if (isTyping && allowSkip) {
      setDisplayedText(text);
      setIsTyping(false);
      setShowOptions(true);
    }
  };

  const handleOptionClick = (option: { text: string; action: string }) => {
    if (onAction) {
      onAction(option.action);
    }
    onClose();
  };

  // Filter options based on conditions
  const availableOptions = options.filter(option => !option.condition || option.condition());

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-center pb-8">
      <div className="w-full max-w-5xl mx-4">
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-xl border border-gray-600 overflow-hidden shadow-2xl">
          {/* Character info bar */}
          <div className="bg-gradient-to-r from-indigo-900 to-purple-900 px-6 py-3 border-b border-slate-600">
            <div className="flex items-center space-x-4">
              {showPortrait && (
                <div className="relative">
                  {portrait ? (
                    <img
                      src={portrait}
                      alt={character}
                      className="w-12 h-12 rounded-full border-2 border-white/20"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full flex items-center justify-center border-2 border-white/20">
                      <span className="text-white font-bold text-lg">
                        {character.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900" />
                </div>
              )}

              <div>
                <h3 className="text-white font-semibold text-xl">{character}</h3>
                <div className="text-indigo-300 text-sm">Speaking...</div>
              </div>
            </div>
          </div>

          {/* Main dialog content */}
          <div className="flex">
            {/* Text area */}
            <div className="flex-1 p-8">
              <div
                className={`text-white text-xl leading-relaxed min-h-[100px] ${allowSkip && isTyping ? 'cursor-pointer' : ''}`}
                onClick={handleSkipTyping}
              >
                {displayedText}
                {isTyping && (
                  <span className="inline-block w-1 h-7 bg-white ml-1 animate-pulse" />
                )}
              </div>

              {/* Action area */}
              <div className="mt-8">
                {showOptions ? (
                  availableOptions.length > 0 ? (
                    <div className="space-y-3">
                      <div className="text-slate-400 text-sm mb-4">Choose your response:</div>
                      {availableOptions.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleOptionClick(option)}
                          className="w-full p-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all transform hover:scale-[1.02] text-left border border-slate-600 hover:border-slate-500 group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-sm font-bold">
                                {index + 1}
                              </div>
                              <span className="group-hover:text-indigo-200 transition-colors">
                                {option.text}
                              </span>
                            </div>
                            <svg className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex justify-end">
                      <button
                        onClick={onClose}
                        className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-lg transition-colors font-medium text-lg"
                      >
                        <span>Continue</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  )
                ) : (
                  <div className="text-slate-400 text-sm text-right">
                    {allowSkip ? 'Click text or press SPACE to skip...' : 'Please wait...'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Control hints */}
          <div className="bg-slate-800 px-6 py-3 border-t border-slate-600">
            <div className="flex justify-between items-center text-xs text-slate-400">
              <div className="flex space-x-6">
                <div className="flex items-center space-x-2">
                  <kbd className="bg-slate-700 px-2 py-1 rounded">SPACE</kbd>
                  <span>{isTyping ? 'Skip' : 'Continue'}</span>
                </div>
                {showOptions && availableOptions.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <kbd className="bg-slate-700 px-2 py-1 rounded">1-{availableOptions.length}</kbd>
                    <span>Quick select</span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <kbd className="bg-slate-700 px-2 py-1 rounded">ESC</kbd>
                <span>Close dialog</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DialogBox;