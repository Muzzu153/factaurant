// src/modules/cms/components/HeroVideo.tsx
import { z } from 'zod';
import { HeroVideoSchema } from '../hero.schema';

export function HeroVideo({ videoUrl, heading }: z.infer<typeof HeroVideoSchema>['props']) {
  return (
    <div className="relative h-[400px] w-full overflow-hidden rounded-theme my-6 group">
      <video src={videoUrl} autoPlay loop muted className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
        <h1 className="text-4xl font-bold font-heading text-white">{heading}</h1>
      </div>
    </div>
  )
}