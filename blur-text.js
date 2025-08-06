/**
 * @class BlurText
 * @version 1.5
 * @author Kornerupin
 * @license MIT
 *
 * Создаёт эффект размытого фона для каждой буквы в текстовом блоке,
 * подстраивая область размытия под размер и положение символа.
 */
class BlurText {
  /**
   * Настройки по умолчанию, включая категории символов.
   * @private
   */
  static _defaultOptions = {
    charCategories: {
      // Высокие буквы (верхняя часть)
      tallUp: 'ABCDEFGHIJKLMNOPQRSTUVWXYZАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯbdfhkltб/|[]{}!?$#@()0123456789',
      // Буквы с хвостами внизу
      tallDown: 'gjpqyуфцчщр',
      // Низкие буквы (строчные)
      low: 'acemnorsuvwxzавгдеёжзийклмнопстхчшъыьэюя:;%',
      // Маленькие символы
      smallUp: '*^´`¨\'"',
      smallCenter: '~-–—=+±«»',
      smallDown: '.,_',
    },
    // CSS-классы, используемые библиотекой.
    wordWrapperClass: 'word-wrapper',
    letterClass: 'letter',
  };

  /**
   * Инициализирует библиотеку для указанных элементов.
   * @param {string|HTMLElement|NodeList} target - CSS-селектор, HTML-элемент или список узлов.
   * @param {object} [options={}] - Пользовательские настройки для переопределения стандартных.
   */
  constructor(target, options = {}) {
    this.options = {
      ...BlurText._defaultOptions,
      ...options,
      charCategories: {
        ...BlurText._defaultOptions.charCategories,
        ...(options.charCategories || {}),
      },
    };

    this._validateCharCoverage();

    const elements = (typeof target === 'string') ? document.querySelectorAll(target) : target;

    if (!elements) {
      console.warn(`BlurText: не найдено элементов для селектора "${target}".`);
      return;
    }

    const elementsArray = (elements instanceof NodeList) ? Array.from(elements) : [elements];

    elementsArray.forEach(element => this._processElement(element));
  }

  /**
   * Проверяет, все ли стандартные символы определены в категориях.
   * @private
   */
  _validateCharCoverage() {
    const allDefinedChars = new Set(Object.values(this.options.charCategories).join(''));
    const masterCharList = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщыьэюя0123456789!@#$%^&*()_+-=[]{}|\\;:\'"<>,.?/~`«»–—';
    const missingChars = [];
    for (const char of masterCharList) {
      if (!allDefinedChars.has(char)) {
        missingChars.push(char);
      }
    }
    if (missingChars.length > 0) {
      console.warn(`BlurText [Предупреждение]: следующие символы не определены ни в одной из категорий и будут использовать категорию по умолчанию ('low'). Рекомендуется добавить их в charCategories для более точного отображения: \n${missingChars.join(' ')}`);
    }
  }

  /**
   * Определяет категорию символа на основе настроек.
   * @param {string} char - Символ для анализа.
   * @returns {string} - Имя категории (CSS-класс).
   * @private
   */
  _getCharCategory(char) {
    for (const [category, chars] of Object.entries(this.options.charCategories)) {
      if (chars.includes(char)) {
        return category;
      }
    }
    return 'low';
  }

  /**
   * Обрабатывает один HTML-элемент, разбивая его текст на стилизованные буквы.
   * @param {HTMLElement} element - Элемент для обработки.
   * @private
   */
  _processElement(element) {
    if (!element || typeof element.textContent === 'undefined') return;
    if (element.dataset.blurTextProcessed) return;
    element.dataset.blurTextProcessed = 'true';

    const text = element.textContent;
    element.innerHTML = '';

    // Разбиваем текст на слова и группы пробельных символов
    const parts = text.split(/(\s+)/);

    parts.forEach(part => {
      // Проверяем, является ли часть строки пробельными символами
      if (part.trim() === '' && part.length > 0) {
        element.appendChild(document.createTextNode(part));
        return;
      }

      // Если это не пробелы, а слово, обрабатываем его
      if (part.length > 0) {
        const wordWrapper = document.createElement('span');
        wordWrapper.className = this.options.wordWrapperClass;
        for (const char of part) {
          const charSpan = document.createElement('span');
          charSpan.className = this.options.letterClass;
          charSpan.textContent = char;
          const category = this._getCharCategory(char);
          charSpan.classList.add(category);
          wordWrapper.appendChild(charSpan);
        }
        element.appendChild(wordWrapper);
      }
    });
  }
}
