import {
  HeadContent,
  Outlet,
  createRootRoute,
  Scripts,
} from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { getTenant } from '../modules/tenant/tenant.server' // Fixed import path

// ✅ IMPORT THE CSS HERE
import indexCss from '../index.css?url'

// 1. DEFINE THE LOADER
// The 'loader' runs on the server before the page renders.
// It calls our 'getTenant' function to fetch the data.
export const Route = createRootRoute({
  notFoundComponent: () => <div>Page not found</div>,
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Food Platform' },
    ],

    links: [{ rel: 'stylesheet', href: indexCss }],
  }),

  // THIS IS THE MAGIC
  // We fetch the tenant here. The return value is automatically
  // available in the component via useLoaderData()
  loader: async () => {
    const tenant = await getTenant()
    return { tenant }
  },

  // beforeLoad: async () => {
  //   const tenant = await getTenant()
  //   return { tenant }
  // },

  component: RootComponent,
})

function RootComponent() {
  // 2. USE THE DATA
  // We grab the tenant data fetched by the loader.
  const { tenant } = Route.useLoaderData()


  return (
    <RootDocument theme={tenant.theme}>
        <Outlet />
    </RootDocument>
  )
}

function RootDocument({
  children,
  theme,
}: {
  children: ReactNode,
  theme: any
}) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body
        style={{
          // INJECT VALUES HERE
          // This is the "Source of Truth".
          // Tailwind will read these variables via index.css
          '--primary': theme.colors.primary,
          '--background': theme.colors.background,
          '--accent': theme.colors.accent,
          '--text': theme.colors.text,
          '--radius-xsm': theme.borderRadius.xsm,
          '--radius-sm': theme.borderRadius.sm,
          '--radius-md': theme.borderRadius.md,
          '--radius-lg': theme.borderRadius.lg,
          '--radius-xlg': theme.borderRadius.xlg,
          '--font-heading': theme.fonts.heading === 'serif' ? 'ui-serif, Georgia' : 'ui-sans-serif, system-ui',
          '--font-body': theme.fonts.body === 'serif' ? 'ui-serif, Georgia' : 'ui-sans-serif, system-ui',

          backgroundColor: theme.colors.background,
        } as React.CSSProperties}
        // Now you can use standard Tailwind classes!
        // No more inline styles needed for bg/font
      >
        {children}
        <Scripts />
      </body>
    </html>
  )
}
