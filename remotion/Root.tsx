import { Composition, Folder } from "remotion";
import {
  defaultReadThisLaunchProps,
  READ_THIS_LAUNCH_DURATION,
  READ_THIS_LAUNCH_FPS,
  ReadThisLaunchVideo,
  type ReadThisLaunchVideoProps,
} from "./compositions/ReadThisLaunchVideo";
import {
  defaultStillReadingLaunchProps,
  STILL_READING_LAUNCH_4K_DURATION,
  STILL_READING_LAUNCH_4K_FPS,
  STILL_READING_LAUNCH_4K_HEIGHT,
  STILL_READING_LAUNCH_4K_WIDTH,
  StillReadingLaunchVideo4K,
  type StillReadingLaunchVideo4KProps,
} from "./compositions/StillReadingLaunchVideo4K";
import {
  defaultStillReadingWebsiteWalkthroughProps,
  STILL_READING_WALKTHROUGH_4K_DURATION,
  STILL_READING_WALKTHROUGH_4K_FPS,
  STILL_READING_WALKTHROUGH_4K_HEIGHT,
  STILL_READING_WALKTHROUGH_4K_WIDTH,
  StillReadingWebsiteWalkthrough4K,
  type StillReadingWebsiteWalkthrough4KProps,
} from "./compositions/StillReadingWebsiteWalkthrough4K";

export const RemotionRoot: React.FC = () => {
  return (
    <Folder name="ProductLaunch">
      <Composition
        id="ReadThisLaunchVideo"
        component={ReadThisLaunchVideo}
        durationInFrames={READ_THIS_LAUNCH_DURATION}
        fps={READ_THIS_LAUNCH_FPS}
        width={1920}
        height={1080}
        defaultProps={
          defaultReadThisLaunchProps satisfies ReadThisLaunchVideoProps
        }
      />
      <Composition
        id="StillReadingLaunchVideo4K"
        component={StillReadingLaunchVideo4K}
        durationInFrames={STILL_READING_LAUNCH_4K_DURATION}
        fps={STILL_READING_LAUNCH_4K_FPS}
        width={STILL_READING_LAUNCH_4K_WIDTH}
        height={STILL_READING_LAUNCH_4K_HEIGHT}
        defaultProps={
          defaultStillReadingLaunchProps satisfies StillReadingLaunchVideo4KProps
        }
      />
      <Composition
        id="StillReadingWebsiteWalkthrough4K"
        component={StillReadingWebsiteWalkthrough4K}
        durationInFrames={STILL_READING_WALKTHROUGH_4K_DURATION}
        fps={STILL_READING_WALKTHROUGH_4K_FPS}
        width={STILL_READING_WALKTHROUGH_4K_WIDTH}
        height={STILL_READING_WALKTHROUGH_4K_HEIGHT}
        defaultProps={
          defaultStillReadingWebsiteWalkthroughProps satisfies StillReadingWebsiteWalkthrough4KProps
        }
      />
    </Folder>
  );
};
