/**
 * Video beat renderer. Delete this file plus scripts/lib/video-beats.mjs and
 * remove the two blocks marked "video beats" to return to stills only.
 *
 * playbackRate is computed upstream so the clip spans its narration exactly.
 */
import { AbsoluteFill, staticFile, useCurrentFrame, interpolate, Easing } from "remotion";
import { Video } from "@remotion/media";
import type { ScreenEntry } from "./schema";

export const VideoBeat: React.FC<{ entry: ScreenEntry }> = ({ entry }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Video
        src={staticFile(entry.src)}
        // the source recording's own audio is never wanted
        muted
        playbackRate={entry.playbackRate ?? 1}
        trimBefore={Math.round((entry.startFrom ?? 0) * 30)}
        style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
      />
    </AbsoluteFill>
  );
};
