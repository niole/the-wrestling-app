import * as React from 'react';
import { FlatList, Text, View, StyleSheet, Button } from 'react-native';
import { Video, AVPlaybackStatus } from 'expo-av';
import Slider from '@react-native-community/slider';
import EditScreenInfo from '../components/EditScreenInfo';
import { RootTabScreenProps } from '../types';

type MatchVideo = {
  id: string;
  uri: string;
  start: number;
  events: MatchEvent[];
  durationMillis: number;
  title?: string;
};

type MatchEvent = {
  timestamp: number;
  label: string;
  durationMillis: number;
};

type Match = {
  videos: MatchVideo[];
  start: number;
};

const max = (ns: number[]) => ns.reduce((a, n) => a > n ? a : n, Number.NEGATIVE_INFINITY);

const defaultData = {
  videos: [
    {
      title: 'the start of the match',
      id: '1',
      uri: 'http://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
      start: new Date('Thu, 03 Mar 2022 19:25:03 GMT').getTime(),
      durationMillis: 7000,
      events: [
        { timestamp: new Date('Thu, 03 Mar 2022 19:25:04 GMT').getTime(), label: 'one', durationMillis: 1500 },
        { timestamp: new Date('Thu, 03 Mar 2022 19:25:06 GMT').getTime(), label: 'one half', durationMillis: 1500 }
      ],
    },
    {
      id: '2',
      uri: 'http://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
      start: new Date('Thu, 03 Mar 2022 19:25:10 GMT').getTime(),
      durationMillis: 27000,
      events: [
        { timestamp: new Date('Thu, 03 Mar 2022 19:25:10 GMT').getTime(), label: 'two', durationMillis: 1500 },
      ],
  }
  ],
  start: new Date('Thu, 03 Mar 2022 19:25:02 GMT').getTime(),
};

type MatchVideoViewProps =  MatchVideo & {
  shouldPlay: boolean;
  timestampOverride?: number,
  selected: boolean,
};

function MatchVideoView(props: MatchVideoViewProps) {
const {
  title,
  id,
  shouldPlay,
  selected,
  uri,
  start,
  events,
  timestampOverride = 0,
} = props;

  const video = React.useRef(null);
  const [status, setStatus] = React.useState({ positionMillis: 0 });
  const [timestamp, setTimestamp] = React.useState<number>(timestampOverride !== undefined && selected ? timestampOverride : status.positionMillis + start)

  React.useEffect(() => {
    setTimestamp(timestampOverride);
  }, [timestampOverride, shouldPlay, selected]);

  React.useEffect(() => {
    if (video.current !== null && video.current !== undefined) {
      if (selected && shouldPlay) {
        video.current.playAsync();
      } else {
        video.current.pauseAsync();
      }
    }
  }, [video, selected, shouldPlay]);

  // TODO assumes that events are sorted in ascending order
  const selectedEvent = events.find((e, i) => {
    const ts = e.timestamp;
    const tsEnd = e.timestamp + e.durationMillis;
    if (i < events.length-1) {
      return ts >= timestamp && timestamp < events[i+1].timestamp;
    }
    return ts >= timestamp;
  });

  const videoPositionMillis = !shouldPlay && !selected ? timestamp - start : undefined;
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>{title}</Text>
        {selectedEvent && <Text style={styles.subTitle}>{selectedEvent.label}</Text>}
      </View>
      <Video
        positionMillis={videoPositionMillis}
        ref={video}
        style={styles.video}
        source={{ uri }}
        resizeMode="contain"
        onPlaybackStatusUpdate={status => {

          setTimestamp(ts => {
            if (Math.abs(ts - (status.positionMillis + start)) >= 400) {
              return status.positionMillis + start;
            }
            return ts;
          });

          setStatus(() => status);

        }}
      />
    </View>
  );
}

const INTERVAL = 500;
const ITEM_HEIGHTT = 700;
export default function TabOneScreen({ navigation }: RootTabScreenProps<'TabOne'>) {
  const flatListRef = React.useRef(null);
  const timer = React.useRef<NodeJS.Timer | null | undefined>();
  const [match, setMatchVideo] = React.useState<Match>({...defaultData, videos: defaultData.videos.sort((a, b) => a.start - b.start) });
  const [isPlaying, setIsPlaying] = React.useState<boolean>(false);
  const [timestamp, updateTimestamp] = React.useState<number>(match.start);
  const [selectedItemIndex, setSelectedItemIndex] = React.useState<number>(0);

  React.useEffect(() => {
    return () => {
      if (timer.current !== null && timer.current !== undefined) {
        clearInterval(timer.current);
      }
    }
  }, [timer])

  React.useEffect(() => {
    if (isPlaying) {
      if (!timer.current) {
        timer.current = setInterval(() => {
          updateTimestamp(ts => ts + INTERVAL)
        }, INTERVAL)
      }
    } else if (timer.current !== null && timer.current !== undefined) {
      clearInterval(timer.current);
      timer.current = null;
    }
  }, [isPlaying, timer]);

  React.useEffect(() => {
    flatListRef.current?.scrollToOffset({
      animated: true,
      offset: ITEM_HEIGHTT * selectedItemIndex,
    });
  }, [selectedItemIndex]);

  React.useEffect(() => {
    const selectedItemIndex = match.videos.findIndex(v => timestamp >= v.start && timestamp <= v.start + v.durationMillis) || 0;
    setSelectedItemIndex(selectedItemIndex);
  }, [timestamp]);

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        getItemLayout={(data, index) => ({ length: ITEM_HEIGHTT, offset: ITEM_HEIGHTT * index, index })}
        data={match.videos}
        extraData={`${isPlaying} ${selectedItemIndex} ${timestamp}`}
        renderItem={({ item, index }) => <MatchVideoView timestampOverride={timestamp} key={item.id} shouldPlay={isPlaying} selected={index === selectedItemIndex} {...item} />}
        keyExtractor={i => i.id}
        />
      <View style={styles.playControls}>
        <Slider
          onValueChange={updateTimestamp}
          value={Math.max(timestamp, match.start)}
          style={{width: 200, height: 40}}
          minimumValue={match.start}
          maximumValue={max(match.videos.map(v => v.start + v.durationMillis))}
          minimumTrackTintColor="#FFFFFF"
          maximumTrackTintColor="#000000"
        />
        <Text>{new Date(timestamp).toISOString()}</Text>
        <View style={styles.playButtons}>
          <Button
            title={isPlaying ? 'Pause' : 'Play'}
            onPress={() => setIsPlaying(!isPlaying)}
          />
          <Button
            title="reset"
            disabled={isPlaying}
            onPress={() => {
              setIsPlaying(false);
              updateTimestamp(match.start);
            }}
          />
        </View>
      </View>
  </View>
  );
}

const styles = StyleSheet.create({
  playControls: { alignItems: 'center' },
  video: { width: 500, height: 300 },
  playButtons: { flexDirection: 'row' },
  subTitle: { fontSize: 16 },
  container: {
    flex: 1,
  },
  title: {
    textAlign: 'left',
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
