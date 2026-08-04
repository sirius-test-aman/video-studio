import { AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame, interpolate } from 'remotion';
import { Audio } from '@remotion/media';
import { Walkthrough as WalkthroughProps } from './schema';
import timelineData from '../public/timeline.json';

const BRAND_ACCENT = '#C8102E'; // replace with your confirmed brand hex

const CAPTION_STYLES: Record<string, React.CSSProperties> = {
  boxed: {
    background: 'rgba(0,0,0,0.78)', color: 'white',
    padding: '14px 28px', borderRadius: 8,
  },
  plain: {
    color: '#111', textShadow: '0 2px 12px rgba(255,255,255,0.9)',
    fontWeight: 700,
  },
  underlined: {
    color: '#111', fontWeight: 700,
    borderBottom: `6px solid ${BRAND_ACCENT}`, paddingBottom: 6,
  },
  highlight: {
    background: BRAND_ACCENT, color: 'white',
    padding: '14px 28px', borderRadius: 6, fontWeight: 700,
  },
};

type TimelineStep = (typeof timelineData.steps)[number];

const Step: React.FC<{ step: TimelineStep; captionStyle: string }> = ({ step, captionStyle }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity }}>
      <Audio src={staticFile(step.audio)} />
      <Img src={staticFile(step.screenshot)} style={{ width: '80%' }} />
      {step.caption && (
        <div
          style={{
            position: 'absolute', top: '6%', left: '50%',
            transform: 'translateX(-50%)', fontSize: 40,
            fontFamily: 'Arial, sans-serif', whiteSpace: 'nowrap',
            ...CAPTION_STYLES[captionStyle],
          }}
        >
          {step.caption}
        </div>
      )}
    </AbsoluteFill>
  );
};

export const Walkthrough: React.FC<WalkthroughProps> = ({ captionStyle }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: 'white' }}>
      {timelineData.steps.map((step) => (
        <Sequence key={step.id} from={step.from} durationInFrames={step.durationInFrames}>
          <Step step={step} captionStyle={captionStyle} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};