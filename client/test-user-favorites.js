// Тестовый скрипт для проверки нового API-эндпоинта user-favorites
// Запустите этот скрипт в консоли браузера

const testUserFavoritesAPI = async () => {
  console.log('Тестирование API маршрута /user-favorites...');
  
  // Получаем токен из localStorage
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('Ошибка: Токен авторизации не найден!');
    return;
  }
  
  console.log('Токен найден:', token.substring(0, 15) + '...');
  
  const API_URL = 'http://localhost:3001/api';
  
  // Тест с fetch
  try {
    console.log(`Отправка GET запроса к ${API_URL}/properties/user-favorites`);
    
    const response = await fetch(`${API_URL}/properties/user-favorites`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    console.log(`Статус ответа: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`Получено ${data.length} избранных объектов.`);
      
      if (data.length > 0) {
        console.log('Первый объект:', {
          id: data[0].id,
          title: data[0].title,
          price: data[0].price,
        });
      }
    } else {
      const errorText = await response.text();
      console.error(`Ошибка: ${response.status} - ${errorText}`);
    }
  } catch (error) {
    console.error('Ошибка при выполнении запроса:', error);
  }
  
  console.log('Тестирование завершено.');
};

// Экспортируем функцию для использования в консоли
typeof window !== 'undefined' && (window.testUserFavoritesAPI = testUserFavoritesAPI);

// Автоматически запускаем при загрузке скрипта
if (typeof window !== 'undefined') {
  console.log('Автоматический запуск тестирования API /user-favorites...');
  setTimeout(testUserFavoritesAPI, 1000);
} 