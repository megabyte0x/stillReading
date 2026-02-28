import { Composition, Folder } from "remotion";
import {
  defaultReadThisLaunchProps,
  READ_THIS_LAUNCH_DURATION,
  READ_THIS_LAUNCH_FPS,
  ReadThisLaunchVideo,
  type ReadThisLaunchVideoProps,
} from "./compositions/ReadThisLaunchVideo";

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
    </Folder>
  );
};
