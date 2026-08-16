/**
 * Comprehensive Country & Major Islamic Cities Directory
 * Used for dynamic prayer time calculations and onboarding/settings pickers.
 */

export interface CountryData {
  country: string
  code: string
  cities: string[]
}

export const COUNTRIES_DATA: CountryData[] = [
  {
    country: 'Pakistan',
    code: 'PK',
    cities: [
      'Karachi',
      'Lahore',
      'Islamabad',
      'Rawalpindi',
      'Faisalabad',
      'Multan',
      'Peshawar',
      'Quetta',
      'Sialkot',
      'Gujranwala',
      'Hyderabad',
    ],
  },
  {
    country: 'Saudi Arabia',
    code: 'SA',
    cities: ['Makkah', 'Madinah', 'Riyadh', 'Jeddah', 'Dammam', 'Khobar', 'Tabuk', 'Taif', 'Abha'],
  },
  {
    country: 'Turkey',
    code: 'TR',
    cities: ['Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Antalya', 'Konya', 'Gaziantep', 'Adana'],
  },
  {
    country: 'United Arab Emirates',
    code: 'AE',
    cities: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Al Ain', 'Fujairah'],
  },
  {
    country: 'United Kingdom',
    code: 'GB',
    cities: ['London', 'Birmingham', 'Manchester', 'Bradford', 'Leeds', 'Glasgow', 'Leicester', 'Luton'],
  },
  {
    country: 'United States',
    code: 'US',
    cities: ['New York', 'Chicago', 'Houston', 'Dallas', 'Los Angeles', 'Detroit', 'Philadelphia', 'Washington DC'],
  },
  {
    country: 'Canada',
    code: 'CA',
    cities: ['Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Ottawa', 'Edmonton', 'Mississauga'],
  },
  {
    country: 'Egypt',
    code: 'EG',
    cities: ['Cairo', 'Alexandria', 'Giza', 'Shubra El Kheima', 'Port Said', 'Suez', 'Mansoura', 'Tanta'],
  },
  {
    country: 'Indonesia',
    code: 'ID',
    cities: ['Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang', 'Makassar', 'Palembang', 'Yogyakarta'],
  },
  {
    country: 'Malaysia',
    code: 'MY',
    cities: ['Kuala Lumpur', 'George Town', 'Johor Bahru', 'Ipoh', 'Shah Alam', 'Petaling Jaya', 'Melaka'],
  },
  {
    country: 'India',
    code: 'IN',
    cities: ['Mumbai', 'Delhi', 'Hyderabad', 'Bangalore', 'Chennai', 'Kolkata', 'Ahmedabad', 'Lucknow'],
  },
  {
    country: 'Germany',
    code: 'DE',
    cities: ['Berlin', 'Munich', 'Frankfurt', 'Cologne', 'Hamburg', 'Dusseldorf', 'Stuttgart'],
  },
  {
    country: 'France',
    code: 'FR',
    cities: ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Strasbourg', 'Lille'],
  },
  {
    country: 'Qatar',
    code: 'QA',
    cities: ['Doha', 'Al Rayyan', 'Al Wakrah', 'Al Khor'],
  },
  {
    country: 'Kuwait',
    code: 'KW',
    cities: ['Kuwait City', 'Al Ahmadi', 'Hawalli', 'Salmiya', 'Farwaniya'],
  },
  {
    country: 'Australia',
    code: 'AU',
    cities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Canberra'],
  },
]
