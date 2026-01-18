// src/modules/cms/components/HeroText.tsx
import { z } from 'zod';
import { HeroTextSchema } from '../hero.schema';

export function HeroText({ heading, subheading }: z.infer<typeof HeroTextSchema>['props']) {
  return (
    <div className="py-20 text-center">
       <h1 className="text-5xl font-extrabold font-heading text-primary mb-4">{heading}</h1>
       <p className="text-xl text-slate-500">{subheading}</p>
    </div>
  )
}