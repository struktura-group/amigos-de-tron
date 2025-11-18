import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CountdownTimerProps {
  targetDate?: Date;
  daysFromNow?: number;
}

export default function CountdownTimer({ targetDate, daysFromNow = 90 }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = targetDate || new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000);

    const calculateTimeLeft = () => {
      const difference = target.getTime() - new Date().getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate, daysFromNow]);

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <Card className="w-20 h-20 flex items-center justify-center bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg">
        <span className="text-3xl font-bold">{value.toString().padStart(2, '0')}</span>
      </Card>
      <span className="text-sm mt-2 text-muted-foreground font-medium">{label}</span>
    </div>
  );

  return (
    <div className="flex gap-4 justify-center items-center">
      <TimeUnit value={timeLeft.days} label="Días" />
      <span className="text-2xl font-bold text-muted-foreground">:</span>
      <TimeUnit value={timeLeft.hours} label="Horas" />
      <span className="text-2xl font-bold text-muted-foreground">:</span>
      <TimeUnit value={timeLeft.minutes} label="Minutos" />
      <span className="text-2xl font-bold text-muted-foreground">:</span>
      <TimeUnit value={timeLeft.seconds} label="Segundos" />
    </div>
  );
}