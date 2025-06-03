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
import { fetchSwellForecastAction } from '@/app/swell-forecaster/actions';
import type { SwellForecastOutput, SwellForecastInput } from '@/ai/flows/swell-forecast'; // Ensure SwellForecastInput is imported

const formSchema = z.object({
  surfSpot: z.string().min(2, { message: 'Surf spot must be at least 2 characters.' }),
});

type FormData = z.infer<typeof formSchema>;

export function SwellForecastClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [forecast, setForecast] = useState<SwellForecastOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    setError(null);
    setForecast(null);

    try {
      // Pass the simplified input object with surfSpot and a placeholder date, typed correctly
      const input: SwellForecastInput = { surfSpot: data.surfSpot, date: '2025-05-30' }; // Placeholder date
      const result = await fetchSwellForecastAction(input);
      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setForecast(result.data);
      }
    } catch (e) {
      setError('An unexpected error occurred. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Get Your Forecast</CardTitle>
          <CardDescription>Enter the name of your desired surf spot.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
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
  );
}
