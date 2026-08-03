import { AbsoluteFill } from 'remotion';
import { Walkthrough as WalkthroughProps } from './schema';

export const Walkthrough: React.FC<WalkthroughProps> = ({ hook, steps }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
      <h1 style={{ fontFamily: 'Arial', fontSize: 60 }}>{hook}</h1>
      <p style={{ fontSize: 30 }}>{steps.length} step(s) loaded</p>
    </AbsoluteFill>
  );
};