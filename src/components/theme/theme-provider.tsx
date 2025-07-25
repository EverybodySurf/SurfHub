// This file is generated by Firebase Studio.
'use client';

import type {FC, PropsWithChildren} from 'react';
import {ThemeProvider as NextThemesProvider} from 'next-themes';
import type {ThemeProviderProps} from 'next-themes/dist/types';

export const ThemeProvider: FC<PropsWithChildren<ThemeProviderProps>> = ({children, ...props}) => {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
};
