export interface Property {
  id: string;
  image: string;
  price: number;
  propertyType: string;
  rooms: string;
  floors: string;
  address: string;
  metro: string;
}

// Новостройки
export const newBuildings: Property[] = [
  {
    id: 'nb1',
    image: '/images/null-image.jpg',
    price: 8500000,
    propertyType: 'Квартира',
    rooms: '2 комн.',
    floors: '8/25 эт.',
    address: 'ул. Ленина, 45, ЖК "Новые горизонты"',
    metro: 'Московская'
  },
  {
    id: 'nb2',
    image: '/images/null-image.jpg',
    price: 6200000,
    propertyType: 'Квартира',
    rooms: '1 комн.',
    floors: '5/17 эт.',
    address: 'пр. Победы, 78, ЖК "Городские просторы"',
    metro: 'Технологический институт'
  },
  {
    id: 'nb3',
    image: '/images/null-image.jpg',
    price: 12500000,
    propertyType: 'Квартира',
    rooms: '3 комн.',
    floors: '12/22 эт.',
    address: 'ул. Садовая, 105, ЖК "Цветочный"',
    metro: 'Невский проспект'
  },
  {
    id: 'nb4',
    image: '/images/null-image.jpg',
    price: 9800000,
    propertyType: 'Квартира',
    rooms: '2 комн.',
    floors: '9/15 эт.',
    address: 'ул. Восточная, 12, ЖК "Солнечный"',
    metro: 'Василеостровская'
  },
  {
    id: 'nb5',
    image: '/images/null-image.jpg',
    price: 14200000,
    propertyType: 'Квартира',
    rooms: '3 комн.',
    floors: '15/20 эт.',
    address: 'пр. Науки, 55, ЖК "Академический"',
    metro: 'Академическая'
  },
  {
    id: 'nb6',
    image: '/images/null-image.jpg',
    price: 7500000,
    propertyType: 'Квартира',
    rooms: '1 комн.',
    floors: '2/24 эт.',
    address: 'ул. Морская, 90, ЖК "Морской бриз"',
    metro: 'Приморская'
  },
  {
    id: 'nb7',
    image: '/images/null-image.jpg',
    price: 11000000,
    propertyType: 'Квартира',
    rooms: '2 комн.',
    floors: '10/18 эт.',
    address: 'ул. Парковая, 34, ЖК "Зеленый квартал"',
    metro: 'Лесная'
  },
  {
    id: 'nb8',
    image: '/images/null-image.jpg',
    price: 18500000,
    propertyType: 'Квартира',
    rooms: '4 комн.',
    floors: '7/14 эт.',
    address: 'пр. Центральный, 120, ЖК "Престиж"',
    metro: 'Площадь Восстания'
  }
];

// Купить
export const forSale: Property[] = [
  {
    id: 'fs1',
    image: '/images/null-image.jpg',
    price: 15500000,
    propertyType: 'Дом',
    rooms: '5 комн.',
    floors: '2 эт.',
    address: 'ул. Загородная, 15, Коттеджный поселок "Лесной"',
    metro: 'Озерки'
  },
  {
    id: 'fs2',
    image: '/images/null-image.jpg',
    price: 9900000,
    propertyType: 'Квартира',
    rooms: '3 комн.',
    floors: '4/9 эт.',
    address: 'ул. Комсомольская, 78',
    metro: 'Автово'
  },
  {
    id: 'fs3',
    image: '/images/null-image.jpg',
    price: 5700000,
    propertyType: 'Квартира',
    rooms: '1 комн.',
    floors: '3/5 эт.',
    address: 'ул. Гагарина, 45',
    metro: 'Горьковская'
  },
  {
    id: 'fs4',
    image: '/images/null-image.jpg',
    price: 22000000,
    propertyType: 'Коммерческая',
    rooms: '5 комн.',
    floors: '1/3 эт.',
    address: 'пр. Невский, 150',
    metro: 'Маяковская'
  },
  {
    id: 'fs5',
    image: '/images/null-image.jpg',
    price: 7800000,
    propertyType: 'Квартира',
    rooms: '2 комн.',
    floors: '6/9 эт.',
    address: 'ул. Советская, 22',
    metro: 'Чернышевская'
  },
  {
    id: 'fs6',
    image: '/images/null-image.jpg',
    price: 45000000,
    propertyType: 'Дом',
    rooms: '7 комн.',
    floors: '3 эт.',
    address: 'Приморское шоссе, 50, поселок "Элитный"',
    metro: 'Комендантский проспект'
  },
  {
    id: 'fs7',
    image: '/images/null-image.jpg',
    price: 6300000,
    propertyType: 'Квартира',
    rooms: '1 комн.',
    floors: '7/12 эт.',
    address: 'ул. Пушкина, 33',
    metro: 'Пушкинская'
  },
  {
    id: 'fs8',
    image: '/images/null-image.jpg',
    price: 12700000,
    propertyType: 'Участок с домом',
    rooms: '4 комн.',
    floors: '2 эт.',
    address: 'Выборгское шоссе, 120, СНТ "Березки"',
    metro: 'Парнас'
  }
];

// Снять
export const forRent: Property[] = [
  {
    id: 'fr1',
    image: '/images/null-image.jpg',
    price: 35000,
    propertyType: 'Квартира',
    rooms: '1 комн.',
    floors: '4/9 эт.',
    address: 'ул. Дыбенко, 15',
    metro: 'Дыбенко'
  },
  {
    id: 'fr2',
    image: '/images/null-image.jpg',
    price: 45000,
    propertyType: 'Квартира',
    rooms: '2 комн.',
    floors: '7/12 эт.',
    address: 'пр. Энгельса, 55',
    metro: 'Удельная'
  },
  {
    id: 'fr3',
    image: '/images/null-image.jpg',
    price: 30000,
    propertyType: 'Квартира',
    rooms: 'Студия',
    floors: '3/16 эт.',
    address: 'ул. Варшавская, 40',
    metro: 'Московская'
  },
  {
    id: 'fr4',
    image: '/images/null-image.jpg',
    price: 80000,
    propertyType: 'Офис',
    rooms: '3 комн.',
    floors: '5/7 эт.',
    address: 'пр. Лиговский, 78',
    metro: 'Лиговский проспект'
  },
  {
    id: 'fr5',
    image: '/images/null-image.jpg',
    price: 120000,
    propertyType: 'Дом',
    rooms: '4 комн.',
    floors: '2 эт.',
    address: 'Новое Токсово, ул. Лесная, 10',
    metro: 'Девяткино'
  },
  {
    id: 'fr6',
    image: '/images/null-image.jpg',
    price: 40000,
    propertyType: 'Квартира',
    rooms: '2 комн.',
    floors: '2/5 эт.',
    address: 'ул. Марата, 30',
    metro: 'Владимирская'
  },
  {
    id: 'fr7',
    image: '/images/null-image.jpg',
    price: 55000,
    propertyType: 'Квартира',
    rooms: '3 комн.',
    floors: '8/16 эт.',
    address: 'Каменноостровский пр., 60',
    metro: 'Петроградская'
  },
  {
    id: 'fr8',
    image: '/images/null-image.jpg',
    price: 150000,
    propertyType: 'Торговое помещение',
    rooms: '2 комн.',
    floors: '1/4 эт.',
    address: 'Невский пр., 90',
    metro: 'Восстания'
  }
]; 