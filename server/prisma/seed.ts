import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting seed...');

    // Create property types
    const propertyTypes = await Promise.all([
      prisma.property_type.create({
        data: { name: 'Apartment', description: 'Living spaces in multi-unit buildings' }
      }),
      prisma.property_type.create({
        data: { name: 'House', description: 'Standalone residential buildings' }
      }),
      prisma.property_type.create({
        data: { name: 'Villa', description: 'Luxury standalone houses' }
      }),
      prisma.property_type.create({
        data: { name: 'Townhouse', description: 'Multi-floor houses sharing walls' }
      }),
      prisma.property_type.create({
        data: { name: 'Commercial', description: 'Properties for business use' }
      })
    ]);
    console.log('Property types created');

    // Create transaction types
    const transactionTypes = await Promise.all([
      prisma.transaction_type.create({
        data: { name: 'Sale' }
      }),
      prisma.transaction_type.create({
        data: { name: 'Rent' }
      })
    ]);
    console.log('Transaction types created');

    // Create cities
    const cities = await Promise.all([
      prisma.city.create({
        data: { 
          name: 'Moscow', 
          region: 'Moscow', 
          country: 'Russia' 
        }
      }),
      prisma.city.create({
        data: { 
          name: 'Saint Petersburg', 
          region: 'Leningrad Region', 
          country: 'Russia' 
        }
      }),
      prisma.city.create({
        data: { 
          name: 'Kazan', 
          region: 'Tatarstan', 
          country: 'Russia' 
        }
      })
    ]);
    console.log('Cities created');

    // Create districts
    const moscowDistricts = await Promise.all([
      prisma.district.create({
        data: { name: 'Central', city_id: cities[0].id }
      }),
      prisma.district.create({
        data: { name: 'Northern', city_id: cities[0].id }
      }),
      prisma.district.create({
        data: { name: 'Southern', city_id: cities[0].id }
      })
    ]);

    const spbDistricts = await Promise.all([
      prisma.district.create({
        data: { name: 'Central', city_id: cities[1].id }
      }),
      prisma.district.create({
        data: { name: 'Admiralteysky', city_id: cities[1].id }
      })
    ]);

    const kazanDistricts = await Promise.all([
      prisma.district.create({
        data: { name: 'Vakhitovsky', city_id: cities[2].id }
      }),
      prisma.district.create({
        data: { name: 'Kirovsky', city_id: cities[2].id }
      })
    ]);
    console.log('Districts created');

    // Create metro stations
    const moscowMetro = await Promise.all([
      prisma.metro_station.create({
        data: { name: 'Arbatskaya', line: 'Arbatsko-Pokrovskaya', color: '#0078BE', city_id: cities[0].id }
      }),
      prisma.metro_station.create({
        data: { name: 'Belorusskaya', line: 'Koltsevaya', color: '#894E35', city_id: cities[0].id }
      })
    ]);

    const spbMetro = await Promise.all([
      prisma.metro_station.create({
        data: { name: 'Nevsky Prospect', line: 'Line 2', color: '#0078BE', city_id: cities[1].id }
      }),
      prisma.metro_station.create({
        data: { name: 'Ploschad Vosstaniya', line: 'Line 1', color: '#D6083B', city_id: cities[1].id }
      })
    ]);
    console.log('Metro stations created');

    // Create features
    const features = await Promise.all([
      prisma.feature.create({
        data: { name: 'Parking', category: 'Exterior' }
      }),
      prisma.feature.create({
        data: { name: 'Balcony', category: 'Exterior' }
      }),
      prisma.feature.create({
        data: { name: 'Elevator', category: 'Building' }
      }),
      prisma.feature.create({
        data: { name: 'Air Conditioning', category: 'Interior' }
      }),
      prisma.feature.create({
        data: { name: 'Furnished', category: 'Interior' }
      }),
      prisma.feature.create({
        data: { name: 'Security System', category: 'Security' }
      }),
      prisma.feature.create({
        data: { name: 'Internet', category: 'Utilities' }
      }),
      prisma.feature.create({
        data: { name: 'Heating', category: 'Utilities' }
      })
    ]);
    console.log('Features created');

    // Create users
    const password = await bcrypt.hash('password123', 10);
    
    const users = await Promise.all([
      prisma.users.create({
        data: {
          email: 'seller@example.com',
          password,
          first_name: 'Ivan',
          last_name: 'Petrov',
          phone: '+79001234567',
          birth_date: new Date('1985-05-15'),
          role: 'SELLER'
        }
      }),
      prisma.users.create({
        data: {
          email: 'buyer@example.com',
          password,
          first_name: 'Elena',
          last_name: 'Ivanova',
          phone: '+79007654321',
          birth_date: new Date('1990-10-20'),
          role: 'BUYER'
        }
      }),
      prisma.users.create({
        data: {
          email: 'agent@example.com',
          password,
          first_name: 'Sergei',
          last_name: 'Smirnov',
          phone: '+79009876543',
          birth_date: new Date('1978-03-25'),
          role: 'AGENT'
        }
      }),
      prisma.users.create({
        data: {
          email: 'admin@example.com',
          password,
          first_name: 'Admin',
          last_name: 'User',
          phone: '+79003456789',
          birth_date: new Date('1982-12-10'),
          role: 'ADMIN'
        }
      })
    ]);
    console.log('Users created');

    // Create properties
    const properties = await Promise.all([
      // Property 1
      prisma.property.create({
        data: {
          title: 'Modern Apartment in City Center',
          description: 'Beautiful modern apartment with great views of the city center. Fully furnished with high-end appliances.',
          price: 15000000,
          area: 85.5,
          rooms: 2,
          floor: 10,
          total_floors: 15,
          address: 'Tverskaya St, 15',
          year_built: 2015,
          status: 'active',
          is_new_building: true,
          property_type_id: propertyTypes[0].id,
          transaction_type_id: transactionTypes[0].id,
          user_id: users[0].id,
          city_id: cities[0].id,
          district_id: moscowDistricts[0].id,
          metro_id: moscowMetro[0].id,
          metro_distance: 0.5,
          images: {
            create: [
              {
                image_url: '/14986.f1fc85aa.jpg',
                is_main: true,
                order: 0
              },
              {
                image_url: '/fill_570_310_006.jpg',
                is_main: false,
                order: 1
              }
            ]
          },
          features: {
            create: [
              {
                feature_id: features[1].id, // Balcony
                value: 'Yes'
              },
              {
                feature_id: features[2].id, // Elevator
                value: 'Yes'
              },
              {
                feature_id: features[3].id, // Air Conditioning
                value: 'Central'
              }
            ]
          }
        }
      }),
      
      // Property 2
      prisma.property.create({
        data: {
          title: 'Spacious Family House',
          description: 'Large family house with garden and garage. Perfect for a big family.',
          price: 25000000,
          area: 180,
          rooms: 4,
          floor: 1,
          total_floors: 2,
          address: 'Garden St, 42',
          year_built: 2008,
          status: 'active',
          is_country: true,
          property_type_id: propertyTypes[1].id,
          transaction_type_id: transactionTypes[0].id,
          user_id: users[0].id,
          city_id: cities[0].id,
          district_id: moscowDistricts[2].id,
          images: {
            create: [
              {
                image_url: '/minimalizm_5814_oleynik.jpg',
                is_main: true,
                order: 0
              },
              {
                image_url: '/NKF-1-result.jpg',
                is_main: false,
                order: 1
              }
            ]
          },
          features: {
            create: [
              {
                feature_id: features[0].id, // Parking
                value: 'Garage'
              },
              {
                feature_id: features[4].id, // Furnished
                value: 'Partially'
              },
              {
                feature_id: features[7].id, // Heating
                value: 'Individual'
              }
            ]
          }
        }
      }),
      
      // Property 3
      prisma.property.create({
        data: {
          title: 'Office Space in Business District',
          description: 'Modern office space in a business center. Ready for immediate occupancy.',
          price: 120000,
          area: 120,
          rooms: 3,
          floor: 5,
          total_floors: 20,
          address: 'Leningradsky Prospekt, 80',
          year_built: 2018,
          status: 'active',
          is_commercial: true,
          property_type_id: propertyTypes[4].id,
          transaction_type_id: transactionTypes[1].id, // Rent
          user_id: users[2].id,
          city_id: cities[0].id,
          district_id: moscowDistricts[1].id,
          metro_id: moscowMetro[1].id,
          metro_distance: 0.3,
          images: {
            create: [
              {
                image_url: '/1.jpg',
                is_main: true,
                order: 0
              },
              {
                image_url: '/kk03.jpg',
                is_main: false,
                order: 1
              }
            ]
          },
          features: {
            create: [
              {
                feature_id: features[2].id, // Elevator
                value: 'Yes'
              },
              {
                feature_id: features[5].id, // Security System
                value: '24/7'
              },
              {
                feature_id: features[6].id, // Internet
                value: 'High-speed Fiber'
              }
            ]
          }
        }
      }),
      
      // Property 4
      prisma.property.create({
        data: {
          title: 'Cozy Studio Apartment',
          description: 'Small but cozy studio apartment for rent. Great for students or young professionals.',
          price: 35000,
          area: 40,
          rooms: 1,
          floor: 3,
          total_floors: 9,
          address: 'Nevsky Prospekt, 112',
          year_built: 2000,
          status: 'active',
          property_type_id: propertyTypes[0].id,
          transaction_type_id: transactionTypes[1].id, // Rent
          user_id: users[2].id,
          city_id: cities[1].id, // Saint Petersburg
          district_id: spbDistricts[0].id,
          metro_id: spbMetro[0].id,
          metro_distance: 0.2,
          images: {
            create: [
              {
                image_url: '/a52ab9eb469ea9d8ddc709b640104fa2.jpg',
                is_main: true,
                order: 0
              },
              {
                image_url: '/dizayn-interyera-kvartiry-101-kv-m-foto-1-4356.jpg',
                is_main: false,
                order: 1
              }
            ]
          },
          features: {
            create: [
              {
                feature_id: features[4].id, // Furnished
                value: 'Fully'
              },
              {
                feature_id: features[6].id, // Internet
                value: 'Included'
              }
            ]
          }
        }
      }),
      
      // Property 5
      prisma.property.create({
        data: {
          title: 'Luxury Penthouse',
          description: 'Exclusive penthouse with panoramic views of the city. Premium finishes throughout.',
          price: 50000000,
          area: 250,
          rooms: 5,
          floor: 30,
          total_floors: 30,
          address: 'Kremlin Embankment, 1',
          year_built: 2020,
          status: 'active',
          is_new_building: true,
          property_type_id: propertyTypes[0].id,
          transaction_type_id: transactionTypes[0].id,
          user_id: users[0].id,
          city_id: cities[0].id,
          district_id: moscowDistricts[0].id,
          metro_id: moscowMetro[0].id,
          metro_distance: 0.8,
          images: {
            create: [
              {
                image_url: '/images.jpg',
                is_main: true,
                order: 0
              }
            ]
          },
          features: {
            create: [
              {
                feature_id: features[0].id, // Parking
                value: 'Underground'
              },
              {
                feature_id: features[1].id, // Balcony
                value: 'Terrace'
              },
              {
                feature_id: features[3].id, // Air Conditioning
                value: 'Smart Climate System'
              },
              {
                feature_id: features[4].id, // Furnished
                value: 'Designer Furniture'
              },
              {
                feature_id: features[5].id, // Security
                value: 'Premium'
              }
            ]
          }
        }
      })
    ]);
    console.log('Properties created');

    // Create favorites
    await Promise.all([
      prisma.favorite.create({
        data: {
          user_id: users[1].id, // Buyer
          property_id: properties[0].id
        }
      }),
      prisma.favorite.create({
        data: {
          user_id: users[1].id, // Buyer
          property_id: properties[4].id
        }
      })
    ]);
    console.log('Favorites created');

    // Create view history
    await Promise.all([
      prisma.view_history.create({
        data: {
          user_id: users[1].id, // Buyer
          property_id: properties[0].id,
          viewed_at: new Date(Date.now() - 86400000 * 2) // 2 days ago
        }
      }),
      prisma.view_history.create({
        data: {
          user_id: users[1].id, // Buyer
          property_id: properties[1].id,
          viewed_at: new Date(Date.now() - 86400000) // 1 day ago
        }
      }),
      prisma.view_history.create({
        data: {
          user_id: users[1].id, // Buyer
          property_id: properties[4].id,
          viewed_at: new Date() // Today
        }
      })
    ]);
    console.log('View history created');

    // Create messages
    await Promise.all([
      prisma.user_message.create({
        data: {
          sender_id: users[1].id, // Buyer
          recipient_id: users[0].id, // Seller
          property_id: properties[0].id,
          message: 'Is this property still available?',
          created_at: new Date(Date.now() - 86400000) // 1 day ago
        }
      }),
      prisma.user_message.create({
        data: {
          sender_id: users[0].id, // Seller
          recipient_id: users[1].id, // Buyer
          property_id: properties[0].id,
          message: 'Yes, it is available. Would you like to schedule a viewing?',
          created_at: new Date(Date.now() - 43200000) // 12 hours ago
        }
      }),
      prisma.user_message.create({
        data: {
          sender_id: users[1].id, // Buyer
          recipient_id: users[2].id, // Agent
          property_id: properties[3].id,
          message: 'I am interested in this property. Can we discuss the rent terms?',
          created_at: new Date()
        }
      })
    ]);
    console.log('Messages created');

    // Create subscriptions
    await prisma.user_subscription.create({
      data: {
        user_id: users[1].id, // Buyer
        name: 'Apartments in Moscow',
        search_params: {
          city_id: cities[0].id,
          property_type_id: propertyTypes[0].id,
          price_min: 10000000,
          price_max: 20000000
        }
      }
    });
    console.log('Subscriptions created');

    console.log('Seed completed successfully');
  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 