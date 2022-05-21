import * as React from 'react';
import { FlatList, Text, View, StyleSheet, Button } from 'react-native';
import Slider from '@react-native-community/slider';
import { max, formatDate } from '../../utils';
import { NewLabel, MatchVideoView } from './MatchVideoView';
import { MatchEvent, Match, MatchVideo } from '../types';
import { ClickableText } from '../../components';
import { ImportVideoView } from './ImportVideoView';

const INTERVAL = 500;
const ITEM_HEIGHTT = 700;

type Props = Match & { goBack: () => void };

export function MatchView({ goBack, ...defaultData }: Props) {
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
    const selectedItemIndex = match.videos.findIndex(v => timestamp >= v.start && timestamp <= v.start + v.durationMillis) || 0;
    setSelectedItemIndex(selectedItemIndex);
  }, [timestamp]);

  if (showImportView) {
    return (
      <ImportVideoView
        doSelect={video => {
          addMatchVideo(match, setMatchVideo)(video);
          setShowImportView(false);
        }}
        goBack={() => setShowImportView(false)}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.matchTitleContainer}>
        <ClickableText onPress={goBack}>
          Back
        </ClickableText>
        <Text style={styles.matchTitle}>{match.title}</Text>
        <Text style={styles.matchTitle}>{formatDate(timestamp)}</Text>
      </View>
      <FlatList
        ref={flatListRef}
        getItemLayout={(data, index) => ({ length: ITEM_HEIGHTT, offset: ITEM_HEIGHTT * index, index })}
        data={match.videos}
        extraData={`${isPlaying} ${selectedItemIndex} ${timestamp}`}
        renderItem={({ item, index }) => (
          <MatchVideoView
            handlePause={() => setIsPlaying(false)}
            addLabel={addLabelToVideo(match, item)(setMatchVideo)}
            timestampOverride={timestamp}
            key={item.id}
            shouldPlay={isPlaying}
            selected={index === selectedItemIndex}
            editLabel={editLabel(match, item)(setMatchVideo)}
            deleteLabel={deleteLabel(match, item)(setMatchVideo)}
            {...item}
          />
        )}
        keyExtractor={i => i.id}
        />
        <View style={styles.playControls}>
          <Button title="Import Videos" onPress ={() => setShowImportView(true)} />
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

const addLabelToVideo = (match: Match, video: MatchVideo) => (setMatchVideo: (m: Match) => void) => (newLabel: NewLabel) => {
  const vidId = match.videos.findIndex(v => v.id === video.id);
  match.videos[vidId] = {
    ...video,
    events: match.videos[vidId].events.concat({
      timestamp: newLabel.ts,
      label: newLabel.label,
      durationMillis: newLabel.durationMillis,
      id: Math.random().toString(),
    }).sort((a, b) => a.timestamp - b.timestamp)
  }
  setMatchVideo(match);
};

const editLabel = (match: Match, video: MatchVideo) => (setMatchVideo: (m: Match) => void) => (labelId: string, newLabel: MatchEvent) => {
  const vidId = match.videos.findIndex(v => v.id === video.id);
  const eId = match.videos[vidId].events.findIndex(e => e.id === labelId);
  const events = match.videos[vidId].events;

  events[eId] = newLabel;

  match.videos[vidId] = { ...video, events };
  setMatchVideo(match);
};

const deleteLabel = (match: Match, video: MatchVideo) => (setMatchVideo: (m: Match) => void) => (labelId: string) => {
  const vidId = match.videos.findIndex(v => v.id === video.id);
  const events = match.videos[vidId].events.filter(e => e.id !== labelId);

  match.videos[vidId] = { ...video, events };
  setMatchVideo(match);
};

const addMatchVideo = (match: Match, setMatchVideo: (m: Match) => void) => (video: MatchVideo) => {
  match.videos.push(video);
  setMatchVideo(match);
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
    marginBottom: 30
  }
});
