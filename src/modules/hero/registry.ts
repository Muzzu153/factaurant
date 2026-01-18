import { registry, z } from 'zod';
import { HeroVideoSchema, HeroTextSchema } from './hero.schema';
import { NavSimpleSchema } from '../navbar/navBar.schema';
import { FooterSimpleSchema } from '../footer/footer.schema';
import { MenuGridSchema, MenuListSchema } from '../menu/menu.schema';
import { menuRegistry } from '../menu/menu.registry';
import { heroRegistry } from './hero.registry';
import { navbarRegistry } from '../navbar/navBar.registry';
import { footerRegistry } from '../footer/footer.registry';

// 1. Zod Union for Type Safety
export const BlockSchema = z.discriminatedUnion('type', [
    HeroVideoSchema,
    HeroTextSchema,
    NavSimpleSchema,
    FooterSimpleSchema,
    MenuGridSchema,
    MenuListSchema
]);

// 2. Component Map
export const COMPONENT_REGISTRY = {

    ...prefixKeys('menu', menuRegistry),
    ...prefixKeys('hero', heroRegistry),
    ...prefixKeys('navbar', navbarRegistry),
    ...prefixKeys('footer', footerRegistry),

    
    //   'hero.video': lazy(() => import('@/modules/cms/components/HeroVideo').then(m => ({ default: m.HeroVideo }))),
    // 'hero_video': HeroVideo,
    // 'hero.text': lazy(() => import('@/modules/cms/components/HeroText').then(m => ({ default: m.HeroText }))),
    // 'menu.grid': lazy(() => import('@/modules/menu/components/MenuGrid').then(m => ({ default: m.MenuGrid }))),

    // // Quick placeholders for Nav/Footer to prevent crash
    // 'menu.list': lazy(() => import('@/modules/menu/components/MenuGrid').then(m => ({ default: m.MenuGrid }))), // Reusing grid for demo
    // 'nav.simple': () => <div className="p-4 border-b font-bold"> Navbar Placeholder</ div >,
} as const ;


function prefixKeys<T extends Record<string, any>>(
    prefix: string,
    registry: T
): Record<string, T[keyof T]> {
    return Object.fromEntries(
        Object.entries(registry).map(([key, value]) => [`${prefix}_${key}`, value])
    )
}