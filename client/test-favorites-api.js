// Скрипт для тестирования API избранного
// Можно запустить в консоли браузера на странице сайта

const testFavoritesAPI = async () => {
  console.log('Запуск теста API избранного...');

  // Получаем токен из localStorage
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('Ошибка: Токен авторизации не найден!');
    return;
  }

  console.log('Токен найден:', token.substring(0, 15) + '...');

  // 1. Тест с использованием fetch
  console.log('\n--- Тест 1: Используем fetch ---');
  try {
    const API_URL = 'http://localhost:3001/api';
    console.log(`Отправка GET запроса к ${API_URL}/properties/favorites`);

    const fetchResponse = await fetch(`${API_URL}/properties/favorites`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    console.log(`Статус ответа fetch: ${fetchResponse.status}`);
    
    // Для любого статуса пытаемся получить тело ответа
    let responseBody;
    try {
      // Сначала пробуем как JSON
      responseBody = await fetchResponse.json();
      console.log('Тело ответа (JSON):', responseBody);
    } catch (jsonError) {
      // Если не удалось как JSON, получаем как текст
      try {
        responseBody = await fetchResponse.text();
        console.log('Тело ответа (текст):', responseBody);
      } catch (textError) {
        console.error('Не удалось прочитать тело ответа');
      }
    }
  } catch (fetchError) {
    console.error('Ошибка при запросе fetch:', fetchError);
  }

  // 2. Тест с использованием XMLHttpRequest (для сравнения)
  console.log('\n--- Тест 2: Используем XMLHttpRequest ---');
  
  const xhrTest = () => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', 'http://localhost:3001/api/properties/favorites', true);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.setRequestHeader('Content-Type', 'application/json');
      
      xhr.onload = function() {
        console.log(`Статус ответа XHR: ${xhr.status}`);
        console.log('Заголовки ответа:', xhr.getAllResponseHeaders());
        
        let responseData;
        try {
          responseData = JSON.parse(xhr.responseText);
          console.log('Тело ответа (JSON):', responseData);
        } catch (e) {
          console.log('Тело ответа (текст):', xhr.responseText);
        }
        
        resolve({
          status: xhr.status,
          data: xhr.responseText
        });
      };
      
      xhr.onerror = function() {
        console.error('Ошибка сетевого запроса XHR');
        reject(new Error('XHR Network Error'));
      };
      
      xhr.send();
    });
  };
  
  try {
    await xhrTest();
  } catch (xhrError) {
    console.error('Ошибка при выполнении XHR запроса:', xhrError);
  }

  console.log('\nТестирование API избранного завершено.');
};

// Экспортируем функцию для использования в консоли
typeof window !== 'undefined' && (window.testFavoritesAPI = testFavoritesAPI);

// Автоматически запускаем тест, если скрипт загружен напрямую
if (typeof window !== 'undefined' && window.location.pathname.includes('favorites')) {
  console.log('Автоматический запуск теста API избранного...');
  setTimeout(testFavoritesAPI, 1000); // Запускаем с небольшой задержкой
} 