'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertTriangle, MessageSquareText } from 'lucide-react';
import { fetchSwellForecastAction, type SwellForecastOutput } from '@/app/swell-forecaster/actions';
import { Calendar } from '@/components/ui/calendar';
import { type DateRange } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { SwellForecastInput } from '@/app/swell-forecaster/actions';

const formSchema = z.object({
  surfSpot: z.string().min(2, { message: 'Surf spot must be at least 2 characters.' }),
});

type FormData = z.infer<typeof formSchema>;
type ForecastOption = 'today' | 'today_and_5_days' | 'future-dates';

export function SwellForecastClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [forecast, setForecast] = useState<SwellForecastOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [forecastOption, setForecastOption] = useState<ForecastOption>('today_and_5_days');

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const submitHandler: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    setError(null);
    setForecast(null);

    let input: SwellForecastInput;

    if (forecastOption === 'today') {
      const today = new Date();
      input = {
        surfSpot: data.surfSpot,
        date: format(today, 'yyyy-MM-dd'),
      };
    } else if (forecastOption === 'today_and_5_days') {
      const start = new Date();
      const end = new Date();
      end.setDate(start.getDate() + 5); // Today + 5 days

      input = {
        surfSpot: data.surfSpot,
        startDate: format(start, 'yyyy-MM-dd'),
        endDate: format(end, 'yyyy-MM-dd'),
      };
    } else { // future-dates
      if (!dateRange?.from) {
        setError("Please select a start date for future forecast.");
        setIsLoading(false);
        return;
      }
      const start = dateRange.from;
      const end = dateRange.to || dateRange.from; // If no end date, use the start date

      input = {
        surfSpot: data.surfSpot,
        startDate: format(start, 'yyyy-MM-dd'),
        endDate: format(end, 'yyyy-MM-dd'),
      };
    }

    // Clear previous date range state if a non-range option is selected
    if (forecastOption === 'today' || forecastOption === 'today_and_5_days') {
      setDateRange(undefined);
    }
    // Clear previous single date state if a range option is selected
    if (forecastOption === 'future-dates') {
      setDate(undefined);
    }

    try {
      const result = await fetchSwellForecastAction(input);
      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setForecast(result.data);
      }
    } catch (e: any) {
      setError('An unexpected error occurred. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Get Your Forecast</CardTitle>
          <CardDescription>Enter the name of your desired surf spot.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(submitHandler)}>
          <CardContent className="space-y-4">
            <div>
              <Input
                id="surfSpot"
                placeholder="e.g., Mavericks, California"
                {...register('surfSpot')}
                aria-invalid={errors.surfSpot ? "true" : "false"}
                className={errors.surfSpot ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {errors.surfSpot && (
                <p className="text-sm text-destructive mt-1">{errors.surfSpot.message}</p>
              )}
            </div>
            
            <div className={"flex flex-col space-y-2"}>
              <Label>Forecast Duration</Label>
              <RadioGroup
                defaultValue={forecastOption}
                onValueChange={(value: ForecastOption) => setForecastOption(value)}
                className={"flex space-x-4"}
              >
                <div className={"flex items-center space-x-2"}>
                  <RadioGroupItem value="today" id="today" />
                  <Label htmlFor="today">Today</Label>
                </div>
                <div className={"flex items-center space-x-2"}>
                  <RadioGroupItem value="today_and_5_days" id="today_and_5_days" />
                  <Label htmlFor="today_and_5_days">Today and 5 Days</Label>
                </div>
                <div className={"flex items-center space-x-2"}>
                  <RadioGroupItem value="future-dates" id="future-dates" />
                  <Label htmlFor="future-dates">Future Dates</Label>
                </div>
              </RadioGroup>
            </div>
            
            {forecastOption === 'future-dates' && (
              <div className="flex flex-col space-y-2">
                <Label htmlFor="datePicker">Select Date(s)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="datePicker"
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && !dateRange && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          `${format(dateRange.from, "LLL dd, y")} - ${format(dateRange.to, "LLL dd, y")}`
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        "Select a date range"
                      )}
                    </Button>

                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={1}
                      disabled={(date) => date < new Date()} // Disable past dates
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Forecasting...
                </>
              ) : (
                'Get Forecast'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {error && (
        <Alert variant="destructive" className="mt-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {forecast && (
        <Card className="mt-6 shadow-lg">
          <CardHeader>
            <div className="flex items-center">
              <MessageSquareText className="h-6 w-6 mr-2 text-primary" />
              <CardTitle>Forecast Summary</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-md whitespace-pre-wrap leading-relaxed text-foreground/90">
              {forecast.forecastSummary}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
    </>
  );
}
