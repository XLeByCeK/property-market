const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Создаем типы недвижимости
    const propertyTypes = [
      { name: 'Квартира', description: 'Жилое помещение в многоквартирном доме' },
      { name: 'Комната', description: 'Отдельная комната в квартире или общежитии' },
      { name: 'Дом', description: 'Частный жилой дом' },
      { name: 'Таунхаус', description: 'Смежный дом с общими стенами и отдельным входом' },
      { name: 'Участок', description: 'Земельный участок без построек' },
      { name: 'Коммерческая', description: 'Помещение для коммерческого использования' },
      { name: 'Офис', description: 'Офисное помещение' },
      { name: 'Склад', description: 'Складское помещение' },
      { name: 'Гараж', description: 'Гараж или машиноместо' },
    ];

    console.log('Создание типов недвижимости...');
    for (const type of propertyTypes) {
      await prisma.property_type.upsert({
        where: { name: type.name },
        update: {},
        create: type,
      });
    }

    // Создаем типы сделок
    const transactionTypes = [
      { name: 'Продажа' },
      { name: 'Аренда' },
      { name: 'Аренда посуточно' },
    ];

    console.log('Создание типов сделок...');
    for (const type of transactionTypes) {
      await prisma.transaction_type.upsert({
        where: { name: type.name },
        update: {},
        create: type,
      });
    }

    // Создаем список особенностей/удобств
    const features = [
      { name: 'Балкон', category: 'Конструкция' },
      { name: 'Лоджия', category: 'Конструкция' },
      { name: 'Кондиционер', category: 'Техника' },
      { name: 'Парковка', category: 'Инфраструктура' },
      { name: 'Лифт', category: 'Инфраструктура' },
      { name: 'Охрана', category: 'Безопасность' },
      { name: 'Мебель', category: 'Интерьер' },
      { name: 'Интернет', category: 'Коммуникации' },
      { name: 'Ремонт', category: 'Состояние' },
      { name: 'Теплый пол', category: 'Комфорт' },
      { name: 'Бассейн', category: 'Удобства' },
      { name: 'Сауна', category: 'Удобства' },
      { name: 'Детская площадка', category: 'Инфраструктура' },
      { name: 'Садовый участок', category: 'Территория' },
    ];

    console.log('Создание особенностей недвижимости...');
    for (const feature of features) {
      await prisma.feature.upsert({
        where: { name: feature.name },
        update: {},
        create: feature,
      });
    }

    // Создаем города
    const cities = [
      { name: 'Москва', country: 'Россия' },
      { name: 'Санкт-Петербург', country: 'Россия' },
      { name: 'Новосибирск', country: 'Россия' },
      { name: 'Екатеринбург', country: 'Россия' },
      { name: 'Казань', country: 'Россия' },
    ];

    console.log('Создание городов...');
    const createdCities = {};
    for (const city of cities) {
      const createdCity = await prisma.city.upsert({
        where: { 
          name_country: {
            name: city.name,
            country: city.country
          } 
        },
        update: {},
        create: city,
      });
      createdCities[city.name] = createdCity;
    }

    // Создаем районы для Москвы
    if (createdCities['Москва']) {
      const moscowDistricts = [
        'Центральный',
        'Северный',
        'Северо-Восточный',
        'Восточный',
        'Юго-Восточный',
        'Южный',
        'Юго-Западный',
        'Западный',
        'Северо-Западный',
        'Зеленоградский',
        'Новомосковский',
        'Троицкий'
      ];

      console.log('Создание районов Москвы...');
      for (const districtName of moscowDistricts) {
        await prisma.district.upsert({
          where: { 
            name_city_id: {
              name: districtName,
              city_id: createdCities['Москва'].id
            } 
          },
          update: {},
          create: {
            name: districtName,
            city_id: createdCities['Москва'].id
          },
        });
      }
    }

    // Создаем станции метро для Москвы
    if (createdCities['Москва']) {
      const moscowMetro = [
        { name: 'Охотный ряд', line: 'Сокольническая', color: '#E42313' },
        { name: 'Лубянка', line: 'Сокольническая', color: '#E42313' },
        { name: 'Театральная', line: 'Замоскворецкая', color: '#2DBE2C' },
        { name: 'Тверская', line: 'Замоскворецкая', color: '#2DBE2C' },
        { name: 'Арбатская', line: 'Арбатско-Покровская', color: '#0252A2' },
        { name: 'Смоленская', line: 'Арбатско-Покровская', color: '#0252A2' },
        { name: 'Курская', line: 'Кольцевая', color: '#894E35' },
        { name: 'Таганская', line: 'Кольцевая', color: '#894E35' },
      ];

      console.log('Создание станций метро Москвы...');
      for (const station of moscowMetro) {
        await prisma.metro_station.upsert({
          where: { 
            name_city_id: {
              name: station.name,
              city_id: createdCities['Москва'].id
            } 
          },
          update: {},
          create: {
            ...station,
            city_id: createdCities['Москва'].id
          },
        });
      }
    }

    console.log('Начальные данные успешно добавлены');
  } catch (error) {
    console.error('Ошибка при заполнении базы данных:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 