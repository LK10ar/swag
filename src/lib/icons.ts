import {
  Aperture, Camera, Crown, Disc3, Film, Flame, Headphones, Heart, Megaphone, Mic, Music, Skull, Sparkles, Star, Ticket, Video, Zap,
  type LucideIcon,
} from 'lucide-react';

export const ICONS: Record<string, LucideIcon> = {
  camera: Camera,
  aperture: Aperture,
  zap: Zap,
  flame: Flame,
  music: Music,
  star: Star,
  skull: Skull,
  disc: Disc3,
  video: Video,
  film: Film,
  mic: Mic,
  headphones: Headphones,
  heart: Heart,
  sparkles: Sparkles,
  ticket: Ticket,
  megaphone: Megaphone,
  crown: Crown,
};

export const ICON_NAMES = Object.keys(ICONS);
