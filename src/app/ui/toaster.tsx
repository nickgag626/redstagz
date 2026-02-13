'use client'

import { Toaster } from 'sonner'

export function AppToaster() {
  return (
    <Toaster
      richColors
      theme="dark"
      position="top-right"
      toastOptions={{
        style: {
          background: 'hsl(var(--card))',
          color: 'hsl(var(--foreground))',
          border: '1px solid hsl(var(--border))',
        },
      }}
    />
  )
}
