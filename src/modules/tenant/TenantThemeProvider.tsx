// import { tenants } from '@/core/db/schema'
// import type { InferSelectModel } from 'drizzle-orm'

// type Tenant = InferSelectModel<typeof tenants>

// interface TenantThemeProviderProps {
//   tenant: Tenant
//   children: React.ReactNode
// }

// export const TenantThemeProvider = ({
//   tenant,
//   children,
// }: TenantThemeProviderProps) => {
//   return (
//     <>
//       {/* Load Custom Fonts dynamically */}
//       {tenant.theme.fontHeading && <link rel="stylesheet" href="" />}

//       <style
//         dangerouslySetInnerHTML={{
//           __html: `
//             @theme inline {
//           --color-primary: ${tenant.theme.primaryColor},
//           --color-background: ${tenant.theme.background},
//           --radius-sm: ${tenant.theme.radius},
//           --fontheading: ${tenant.theme.fontHeading === 'serif' ? 'ui-serif, Georgia' : 'ui-sans-serif, system-ui'},
//             }`,
//         }}
//       />
//       {children}
//     </>
//   )
// }
