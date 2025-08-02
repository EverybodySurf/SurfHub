'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, MapPin, Search, X } from 'lucide-react';
import { LocationService, type LocationResult, createLocationDisplayName } from '@/lib/location-service';

interface LocationSearchProps {
  onLocationSelect: (location: LocationResult) => void;
  placeholder?: string;
  className?: string;
  initialQuery?: string;
}

export function LocationSearch({ 
  onLocationSelect, 
  placeholder = "Search for a city or surf spot...", 
  className = "",
  initialQuery = ""
}: LocationSearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationResult | null>(null);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const locationService = useRef<LocationService | null>(null);

  // Initialize location service
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY) {
      locationService.current = new LocationService(process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY);
    }
  }, []);

  // Handle search with debouncing
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      if (!locationService.current) return;

      setIsLoading(true);
      try {
        const searchResults = await locationService.current.searchLocations(query);
        setResults(searchResults);
        setShowResults(searchResults.length > 0);
      } catch (error) {
        console.error('Location search failed:', error);
        setResults([]);
        setShowResults(false);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  // Handle click outside to close results
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocationSelect = (location: LocationResult) => {
    setSelectedLocation(location);
    setQuery(location.displayName);
    setShowResults(false);
    onLocationSelect(location);
  };

  const handleClearSelection = () => {
    setSelectedLocation(null);
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  const getTypeIcon = (type: LocationResult['type']) => {
    switch (type) {
      case 'surf_spot':
        return '🏄‍♂️';
      case 'beach':
        return '🏖️';
      case 'city':
        return '🏙️';
      default:
        return '📍';
    }
  };

  const getTypeBadge = (type: LocationResult['type']) => {
    switch (type) {
      case 'surf_spot':
        return <Badge variant="default" className="text-xs">Surf Spot</Badge>;
      case 'beach':
        return <Badge variant="secondary" className="text-xs">Beach</Badge>;
      case 'city':
        return <Badge variant="outline" className="text-xs">City</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Location</Badge>;
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setShowResults(true)}
          className="pl-10 pr-10"
        />
        {selectedLocation && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearSelection}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && results.length > 0 && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-y-auto shadow-lg">
          <CardContent className="p-0">
            {results.map((location, index) => (
              <div
                key={`${location.lat}-${location.lon}-${index}`}
                onClick={() => handleLocationSelect(location)}
                className="flex items-center gap-3 p-3 hover:bg-accent cursor-pointer border-b last:border-b-0"
              >
                <div className="text-2xl">
                  {getTypeIcon(location.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm truncate">
                      {location.name}
                    </h4>
                    {getTypeBadge(location.type)}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {location.state 
                      ? `${location.city}, ${location.state}, ${location.country}`
                      : `${location.city}, ${location.country}`
                    }
                  </p>
                  {location.description && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {location.description}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">
                    {location.lat.toFixed(2)}, {location.lon.toFixed(2)}
                  </div>
                  <Badge variant="secondary" className="text-xs mt-1">
                    {location.source}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* No Results Message */}
      {showResults && results.length === 0 && !isLoading && query.length >= 2 && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="text-muted-foreground">
              <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No locations found for "{query}"</p>
              <p className="text-xs mt-1">Try searching for a city name or famous surf spot</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Location Display */}
      {selectedLocation && (
        <div className="mt-2 p-2 bg-primary/10 rounded-lg border">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getTypeIcon(selectedLocation.type)}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {selectedLocation.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {selectedLocation.state 
                  ? `${selectedLocation.city}, ${selectedLocation.state}, ${selectedLocation.country}`
                  : `${selectedLocation.city}, ${selectedLocation.country}`
                }
              </p>
            </div>
            {getTypeBadge(selectedLocation.type)}
          </div>
        </div>
      )}
    </div>
  );
}
