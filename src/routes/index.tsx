import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute("/")({ component: App })

function App() {
  return ( 
  
    <div className='p-4'>
      <h1 className='text-2xl font-bold'>Factory Setup</h1>
      <p>Waiting for modules....</p>
    </div>

  )
}
