import { z } from 'zod'
import { HeroTextSchema, HeroVideoSchema } from '../../../modules/hero/hero.schema'
import { MenuGridSchema, MenuListSchema } from '../../../modules/menu/menu.schema'
import { FooterSimpleSchema } from '../../../modules/footer/footer.schema'
import { NavSimpleSchema } from '../../../modules/navbar/navBar.schema'

export const BlockSchema = z.discriminatedUnion('type', [
    HeroTextSchema,
    HeroVideoSchema,
    MenuGridSchema,
    MenuListSchema,
    FooterSimpleSchema,
    NavSimpleSchema,
])

