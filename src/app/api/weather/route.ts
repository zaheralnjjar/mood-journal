import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = searchParams.get('lat') || '24.7136';
  const lon = searchParams.get('lon') || '46.6753';
  
  try {
    // استخدام Open-Meteo API (مجاني بدون مفتاح)
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch weather');
    }
    
    const data = await response.json();
    
    // تحويل كود الطقس إلى وصف وأيقونة
    const weatherCode = data.current?.weather_code || 0;
    let description = 'مشمس';
    let icon = '01d';
    
    if (weatherCode >= 0 && weatherCode <= 3) {
      description = weatherCode === 0 ? 'مشمس' : 'غائم جزئياً';
      icon = weatherCode === 0 ? '01d' : '02d';
    } else if (weatherCode >= 45 && weatherCode <= 48) {
      description = 'ضبابي';
      icon = '50d';
    } else if (weatherCode >= 51 && weatherCode <= 67) {
      description = 'ممطر';
      icon = '10d';
    } else if (weatherCode >= 71 && weatherCode <= 86) {
      description = 'مثلج';
      icon = '13d';
    } else if (weatherCode >= 95) {
      description = 'عاصفة';
      icon = '11d';
    }
    
    // تحديد الموقع
    let location = 'موقعك الحالي';
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    
    if (latNum >= 24 && latNum < 25 && lonNum >= 46 && lonNum < 47) {
      location = 'الرياض';
    } else if (latNum >= 21 && latNum < 22 && lonNum >= 39 && lonNum < 40) {
      location = 'جدة';
    } else if (latNum >= 24 && latNum < 25 && lonNum >= 38 && lonNum < 39) {
      location = 'المدينة المنورة';
    } else if (latNum >= 21 && latNum < 22 && lonNum >= 40 && lonNum < 41) {
      location = 'مكة المكرمة';
    }
    
    return NextResponse.json({
      weather: {
        temp: Math.round(data.current?.temperature_2m || 28),
        description,
        icon,
        humidity: data.current?.relative_humidity_2m,
        windSpeed: data.current?.wind_speed_10m,
      },
      location,
    });
  } catch (error) {
    console.error('Weather API error:', error);
    
    // إرجاع بيانات افتراضية
    return NextResponse.json({
      weather: {
        temp: 28,
        description: 'مشمس',
        icon: '01d',
        humidity: 45,
        windSpeed: 12,
      },
      location: 'الرياض',
    });
  }
}
