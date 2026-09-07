import Svg, { Defs, LinearGradient, Stop, Rect, Path, Circle, Line } from 'react-native-svg';
import { colors } from '../constants/theme';

interface AphoraLogoProps {
  size?: number;
}

// Brand mark: an infinity-shaped ribbon (lavender -> plum gradient) with two
// circular "windows" - a brain icon on the left lobe, a speech bubble with a
// typing-indicator on the right - plus a few sparkle strokes suggesting
// motion near the speech-bubble side. Built as plain filled/stroked shapes
// (no SVG filters) since filter support varies across platforms in
// react-native-svg; depth/gloss are faked with a soft offset duplicate and a
// translucent highlight path instead, which renders reliably everywhere.
export default function AphoraLogo({ size = 100 }: AphoraLogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Defs>
        <LinearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={colors.lavender} />
          <Stop offset="100%" stopColor={colors.background} />
        </LinearGradient>
        <LinearGradient id="ribbonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={colors.lavender} />
          <Stop offset="100%" stopColor={colors.plum} />
        </LinearGradient>
      </Defs>

      {/* Rounded-square background */}
      <Rect x="2" y="2" width="116" height="116" rx="30" fill="url(#bgGradient)" />

      {/* Soft drop shadow for the ribbon - offset duplicate, no filters */}
      <Path
        d="M60,63 C45,38 15,38 15,63 C15,88 45,88 60,63 C75,38 105,38 105,63 C105,88 75,88 60,63 Z"
        fill={colors.plumDark}
        opacity={0.18}
      />

      {/* Infinity ribbon */}
      <Path
        d="M60,60 C45,35 15,35 15,60 C15,85 45,85 60,60 C75,35 105,35 105,60 C105,85 75,85 60,60 Z"
        fill="url(#ribbonGradient)"
      />

      {/* Glossy highlight along the top of each lobe */}
      <Path
        d="M22,46 Q35,38 48,48"
        stroke={colors.white}
        strokeOpacity={0.4}
        strokeWidth={3}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M72,48 Q85,38 98,46"
        stroke={colors.white}
        strokeOpacity={0.4}
        strokeWidth={3}
        strokeLinecap="round"
        fill="none"
      />

      {/* Left window: brain icon on a deep-plum circle */}
      <Circle cx="32" cy="60" r="17" fill={colors.plumDark} />
      <Path
        d="M22,62 C22,54 27,50 32,50 C37,50 42,54 42,62 C42,68 38,71 32,71 C26,71 22,68 22,62 Z"
        fill={colors.white}
        opacity={0.92}
      />
      <Path
        d="M32,52 C31,56 33,60 32,66"
        stroke={colors.plumDark}
        strokeWidth={1.5}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M26,54 Q28,51 30,54"
        stroke={colors.plumDark}
        strokeWidth={1.2}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M34,54 Q36,51 38,54"
        stroke={colors.plumDark}
        strokeWidth={1.2}
        strokeLinecap="round"
        fill="none"
      />

      {/* Right window: speech bubble + typing dots on a light circle */}
      <Circle cx="88" cy="60" r="17" fill={colors.background} />
      <Path
        d="M79,53 h18 a4,4 0 0 1 4,4 v8 a4,4 0 0 1 -4,4 h-9 l-4,5 v-5 h-5 a4,4 0 0 1 -4,-4 v-8 a4,4 0 0 1 4,-4 Z"
        fill="none"
        stroke={colors.plumDark}
        strokeWidth={2}
      />
      <Circle cx="84" cy="61" r="1.6" fill={colors.plumDark} />
      <Circle cx="88" cy="61" r="1.6" fill={colors.plumDark} />
      <Circle cx="92" cy="61" r="1.6" fill={colors.plumDark} />

      {/* Sparkle accents near the speech-bubble side */}
      <Line x1="98" y1="38" x2="106" y2="30" stroke={colors.white} strokeWidth={2.5} strokeLinecap="round" opacity={0.85} />
      <Line x1="104" y1="42" x2="110" y2="36" stroke={colors.white} strokeWidth={2} strokeLinecap="round" opacity={0.85} />
      <Line x1="92" y1="30" x2="97" y2="25" stroke={colors.white} strokeWidth={1.5} strokeLinecap="round" opacity={0.85} />
    </Svg>
  );
}
