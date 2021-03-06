import * as React from 'react';
import * as R from 'ramda';
import { FlatList, Text, View, StyleSheet, Button } from 'react-native';
import Slider from '@react-native-community/slider';
import { getMatchDurationMillis, max, formatDate } from '../../utils';
import { NewLabel, MatchVideoView } from './MatchVideoView';
import { MatchEvent, Match, MatchVideo } from '../types';
import { ClickableText } from '../../components';
import { ImportVideoView } from './ImportVideoView';

const INTERVAL = 500;
const ITEM_HEIGHTT = 700;

type Props = Match & {
  onDelete: () => void,
  goBack: () => void,
  onChange: (m: Match) => void,
};

export function MatchView({ onChange, onDelete, goBack, ...defaultData }: Props) {
  const flatListRef = React.useRef(null);
  const timer = React.useRef<NodeJS.Timer | null | undefined>();
  const [match, setMatchVideo] = React.useState<Match>({...defaultData, videos: defaultData.videos.sort((a, b) => a.start - b.start) });
  const [isPlaying, setIsPlaying] = React.useState<boolean>(false);
  const [timestamp, updateTimestamp] = React.useState<number>(match.start);
  const [selectedItemIndex, setSelectedItemIndex] = React.useState<number>(0);
  const [showImportView, setShowImportView] = React.useState<boolean>(false);

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
    const selectedItemIndex = R.findIndex((v: MatchVideo) => timestamp >= v.start && timestamp <= v.start + v.durationMillis)(match.videos) || 0;
    setSelectedItemIndex(selectedItemIndex);
  }, [timestamp, match]);

  if (showImportView) {
    return (
      <ImportVideoView
        doSelect={video => {
          R.pipe(addMatchVideo(match), doSetMatchVideo(onChange, setMatchVideo))(video);
          setShowImportView(false);
        }}
        goBack={() => setShowImportView(false)}
      />
    );
  }
  return (
    <View style={styles.container}>
      <View style={styles.matchTitleContainer}>
        <View style={{ justifyContent: 'space-between', flexDirection: 'row'}}>
          <ClickableText onPress={goBack}>
            Back
          </ClickableText>
          <Button title="Delete Match" onPress={R.pipe(onDelete, goBack)} />
        </View>
        <Text style={styles.matchTitle}>{match.title}</Text>
        <Text style={styles.matchTitle}>{formatDate(match.start)}</Text>
        <Text style={styles.matchTitle}>-</Text>
        <Text style={styles.matchTitle}>{formatDate(match.start + getMatchDurationMillis(match))}</Text>
        <Text style={styles.matchTitle}>{formatDate(timestamp)}</Text>
      </View>
      <FlatList
        ref={flatListRef}
        getItemLayout={(data, index) => ({ length: ITEM_HEIGHTT, offset: ITEM_HEIGHTT * index, index })}
        data={match.videos}
        extraData={`${isPlaying} ${selectedItemIndex} ${timestamp}`}
        renderItem={({ item, index }) => (
          <MatchVideoView
            onChange={R.pipe(video => updateVideo(match, video, v => v), doSetMatchVideo(onChange, setMatchVideo))}
            handlePause={() => setIsPlaying(false)}
            addLabel={R.pipe(addLabelToVideo(match, item), doSetMatchVideo(onChange, setMatchVideo))}
            timestampOverride={timestamp}
            key={item.id}
            shouldPlay={isPlaying}
            selected={index === selectedItemIndex}
            editLabel={R.pipe(editLabel(match, item), doSetMatchVideo(onChange, setMatchVideo))}
            deleteLabel={R.pipe(deleteLabel(match, item), doSetMatchVideo(onChange, setMatchVideo))}
            updateStartTime={R.pipe(updateVideoStartTime(match, item), doSetMatchVideo(onChange, setMatchVideo))}
            deleteVideo={R.pipe(deleteVideo(match), doSetMatchVideo(onChange, setMatchVideo))}
            {...item}
          />
        )}
        keyExtractor={i => i.id}
        />
        <View style={styles.playControls}>
          <Button title="Import Video" onPress ={() => setShowImportView(true)} />
          {match.videos.length > 0 &&<><Slider
            onValueChange={ts => {
              if (isPlaying) {
                setIsPlaying(false);
              }
              updateTimestamp(ts);
            }}
            value={Math.max(timestamp, match.start)}
            style={{width: 200, height: 40}}
            minimumValue={match.start}
            maximumValue={max(match.videos.map(v => v.start + v.durationMillis))}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#000000"
          />
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
        </View></>}
      </View>
  </View>
  );
}

const addLabelToVideo = (match: Match, video: MatchVideo) => (newLabel: NewLabel) => {
  return updateVideo(match, video, v => {
    return {
      ...v,
      events: v.events.concat({
        timestamp: newLabel.ts,
        label: newLabel.label,
        durationMillis: newLabel.durationMillis,
        id: Math.random().toString(),
      }).sort((a, b) => a.timestamp - b.timestamp)
    }
  });
};

const editLabel = (match: Match, video: MatchVideo) => (labelId: string, newLabel: MatchEvent) => {
  return updateVideo(match, video, v => {
    const { events } = v;
    const eId = R.findIndex((e: MatchEvent) => e.id === labelId)(events);

    events[eId] = newLabel;
    return { ...video, events };
  });
};

const deleteLabel = (match: Match, video: MatchVideo) => (labelId: string) => {
  return updateVideo(match, video, v => {
    const events = v.events.filter(e => e.id !== labelId);
    return { ...video, events };
  });
};

const addMatchVideo = (match: Match) => (video: MatchVideo) => {
  return {
    ...match,
    videos: [...match.videos, video],
  };
};

const updateVideo = (match: Match, oldVideo: MatchVideo, updater: (v: MatchVideo) => MatchVideo): Match => {
  const updateIndex = R.findIndex((v: MatchVideo) => v.id === oldVideo.id)(match.videos);
  const videos = match.videos;
  videos[updateIndex] = updater(oldVideo);
  return {
    ...match,
    videos,
  };
};

const updateVideoStartTime = (match: Match, oldVideo: MatchVideo) => (newStart: number): Match => {
  return updateVideo(match, oldVideo, v => ({
    ...oldVideo,
    start: newStart,
  }));
};

const deleteVideo = (match: Match) => (videoId: string): Match => {
  return {
    ...match,
    videos: match.videos.filter(n => n.id !== videoId),
  };
};

const doSetMatchVideo = (onChange: (m: Match) => void, setMatchVideo: (m: Match) => void) => (m: Match) => {
  onChange(m);
  setMatchVideo(m);
};

const styles = StyleSheet.create({
  playControls: { backgroundColor: 'grey', alignItems: 'center' },
  video: { width: 500, height: 300 },
  playButtons: { flexDirection: 'row' },
  subTitle: { fontSize: 16 },
  container: {
    flex: 1,
  },
  title: {
    textAlign: 'left',
    fontSize: 20,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  matchTitle: { fontSize: 22, textAlign: 'center' },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
  matchTitleContainer: {
    backgroundColor: 'grey',
    paddingBottom: 10
  }
});
