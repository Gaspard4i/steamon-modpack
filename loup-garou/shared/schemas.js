import { z } from 'zod';
import { LIMITS, PALETTE, PSEUDO_RE, SETTING_BOUNDS } from './constants.js';

const colorIds = PALETTE.map((c) => c.id);

export const pseudoSchema = z
  .string()
  .transform((s) => s.normalize('NFC').trim().replace(/\s+/g, ' '))
  .pipe(z.string().min(LIMITS.pseudoMin).max(LIMITS.pseudoMax).regex(PSEUDO_RE));

export const colorSchema = z.enum(colorIds);

export const joinSchema = z.object({
  pseudo: pseudoSchema,
  color: colorSchema,
  password: z.string().max(100).optional().default(''),
  token: z.string().max(64).optional(),
});

export const profileSchema = z.object({ pseudo: pseudoSchema, color: colorSchema });
export const readySchema = z.object({ ready: z.boolean() });

const bound = (k) => z.number().int().min(SETTING_BOUNDS[k][0]).max(SETTING_BOUNDS[k][1]);
export const configSchema = z.object({
  roles: z.object({
    seer: z.boolean(), witch: z.boolean(), hunter: z.boolean(),
    cupid: z.boolean(), littlegirl: z.boolean(), thief: z.boolean(),
  }).partial().optional(),
  wolves: z.number().int().min(0).max(8).optional(),
  mayor: z.boolean().optional(),
  dealSeconds: bound('dealSeconds').optional(),
  nightSeconds: bound('nightSeconds').optional(),
  discussionSeconds: bound('discussionSeconds').optional(),
  voteSeconds: bound('voteSeconds').optional(),
});

export const kickSchema = z.object({ id: z.string().max(40) });

export const actionSchema = z.object({
  type: z.enum([
    'vote', 'wolf_vote', 'seer_look', 'witch', 'cupid_link',
    'thief_pick', 'spy', 'hunter_shot', 'mayor_vote', 'skip_discussion',
  ]),
  targetId: z.string().max(40).nullable().optional(),
  targets: z.array(z.string().max(40)).max(2).optional(),
  choice: z.enum(['save', 'poison', 'pass']).optional(),
  index: z.number().int().min(-1).max(1).optional(),
});

export const chatSchema = z.object({
  text: z.string().transform((s) => s.normalize('NFC').trim()).pipe(z.string().min(1).max(LIMITS.chatMax)),
});
