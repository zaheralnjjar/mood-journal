import { NextRequest, NextResponse } from 'next/server';

// حساب مواقيت الصلاة
function calculatePrayerTimes(lat: number, lng: number, date: Date) {
  // طريقة حساب بسيطة (يمكن تحسينها لاحقاً)
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  
  // زاوية الشمس
  const declination = -23.45 * Math.cos((360 / 365) * (dayOfYear + 10) * (Math.PI / 180));
  
  // الوقت المحلي للظهر
  const timezone = Math.round(lng / 15);
  const solarNoon = 12 - (lng / 15 - timezone);
  
  // حساب أوقات الصلاة (تقريبي)
  const fajrAngle = 18; // درجة تحت الأفق
  const ishaAngle = 17;
  const asrFactor = 1; // مذهب الشافعي
  
  // حساب الفجر والعشاء
  const cosFajr = (Math.sin(-fajrAngle * Math.PI / 180) - Math.sin(lat * Math.PI / 180) * Math.sin(declination * Math.PI / 180)) /
                  (Math.cos(lat * Math.PI / 180) * Math.cos(declination * Math.PI / 180));
  const fajrOffset = Math.acos(Math.max(-1, Math.min(1, cosFajr))) * (180 / Math.PI) / 15;
  
  const cosIsha = (Math.sin(-ishaAngle * Math.PI / 180) - Math.sin(lat * Math.PI / 180) * Math.sin(declination * Math.PI / 180)) /
                  (Math.cos(lat * Math.PI / 180) * Math.cos(declination * Math.PI / 180));
  const ishaOffset = Math.acos(Math.max(-1, Math.min(1, cosIsha))) * (180 / Math.PI) / 15;
  
  // الشروق والغروب
  const cosSunrise = -Math.tan(lat * Math.PI / 180) * Math.tan(declination * Math.PI / 180);
  const sunriseOffset = Math.acos(Math.max(-1, Math.min(1, cosSunrise))) * (180 / Math.PI) / 15;
  
  // العصر
  const asrAngle = Math.atan(1 / (asrFactor + Math.tan(Math.abs(lat - declination) * Math.PI / 180))) * (180 / Math.PI);
  const cosAsr = (Math.sin(asrAngle * Math.PI / 180) - Math.sin(lat * Math.PI / 180) * Math.sin(declination * Math.PI / 180)) /
                 (Math.cos(lat * Math.PI / 180) * Math.cos(declination * Math.PI / 180));
  const asrOffset = Math.acos(Math.max(-1, Math.min(1, cosAsr))) * (180 / Math.PI) / 15;
  
  // تنسيق الوقت
  const formatTime = (hours: number): string => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };
  
  return [
    { name: 'fajr', nameAr: 'الفجر', time: formatTime(solarNoon - fajrOffset), timestamp: getTimeStamp(date, solarNoon - fajrOffset) },
    { name: 'dhuhr', nameAr: 'الظهر', time: formatTime(solarNoon), timestamp: getTimeStamp(date, solarNoon) },
    { name: 'asr', nameAr: 'العصر', time: formatTime(solarNoon + asrOffset), timestamp: getTimeStamp(date, solarNoon + asrOffset) },
    { name: 'maghrib', nameAr: 'المغرب', time: formatTime(solarNoon + sunriseOffset), timestamp: getTimeStamp(date, solarNoon + sunriseOffset) },
    { name: 'isha', nameAr: 'العشاء', time: formatTime(solarNoon + ishaOffset), timestamp: getTimeStamp(date, solarNoon + ishaOffset) },
  ];
}

function getTimeStamp(date: Date, hours: number): number {
  const d = new Date(date);
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  d.setHours(h, m, 0, 0);
  if (h < 5) d.setDate(d.getDate() + 1); // إذا كان الوقت بعد منتصف الليل
  return d.getTime();
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = parseFloat(searchParams.get('lat') || '24.7136');
  const lng = parseFloat(searchParams.get('lng') || '46.6753');
  
  const today = new Date();
  const times = calculatePrayerTimes(lat, lng, today);
  
  // تحديد المدينة بناءً على الإحداثيات
  let location = 'موقعك الحالي';
  if (lat >= 24 && lat < 25 && lng >= 46 && lng < 47) {
    location = 'الرياض';
  } else if (lat >= 21 && lat < 22 && lng >= 39 && lng < 40) {
    location = 'جدة';
  } else if (lat >= 24 && lat < 25 && lng >= 38 && lng < 39) {
    location = 'المدينة المنورة';
  } else if (lat >= 21 && lat < 22 && lng >= 40 && lng < 41) {
    location = 'مكة المكرمة';
  }
  
  return NextResponse.json({
    times,
    location,
    date: today.toISOString(),
    coordinates: { lat, lng },
  });
}
