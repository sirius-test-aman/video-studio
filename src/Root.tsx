import "./index.css";
import { Composition } from "remotion";
import { Walkthrough, calculateWalkthroughMetadata } from "./Walkthrough";
import { walkthroughSchema } from "./schema";
import timelineData from "../public/timeline.json";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Walkthrough"
      component={Walkthrough}
      durationInFrames={300}
      fps={30}
      width={1920}
      height={1080}
      schema={walkthroughSchema}
      calculateMetadata={calculateWalkthroughMetadata}
      defaultProps={timelineData}
    />
  );
};
