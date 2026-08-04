import "./index.css";
import { Composition } from "remotion";
import { Walkthrough } from "./Walkthrough";
import { walkthroughSchema } from "./schema";
import timelineData from "../public/timeline.json";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Walkthrough"
        component={Walkthrough}
        durationInFrames={timelineData.totalDurationInFrames}
        fps={timelineData.fps}
        width={1920}
        height={1080}
        schema={walkthroughSchema}
        defaultProps={{
          captionStyle: "boxed" as const,
          language: "en-US",
          voiceId: "",
          musicTrack: null,
        }}
      />
    </>
  );
};