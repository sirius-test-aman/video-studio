import React from "react";
import { Composition } from "remotion";
import { THUMBS } from "./designs";
import { H, W } from "./tokens";

export const ThumbnailRoot: React.FC = () => (
  <>
    {THUMBS.map((t) => (
      <Composition
        key={t.id}
        id={t.id}
        component={t.component}
        durationInFrames={1}
        fps={30}
        width={W}
        height={H}
      />
    ))}
  </>
);
