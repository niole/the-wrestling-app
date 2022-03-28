import * as React from 'react';
import { Modal, TextInput, Text, View, StyleSheet, Button } from 'react-native';
import { Video, AVPlaybackStatus } from 'expo-av';
import { MatchVideo, MatchEvent } from '../types';

export type NewLabel = { durationMillis: number, label: string, ts: number };

type MatchVideoViewProps =  MatchVideo & {
  shouldPlay: boolean;
  timestampOverride?: number,
  selected: boolean,
  handlePause: () => void;
  addLabel: (nl: NewLabel) => void;
  editLabel: (labelId: string, nl: MatchEvent) => void;
  deleteLabel: (labelId: string) => void;
};

export function MatchVideoView(props: MatchVideoViewProps) {
const {
  title,
  id,
  shouldPlay,
  selected,
  uri,
  start,
  events,
  handlePause,
  addLabel,
  editLabel,
  deleteLabel,
  timestampOverride = 0,
} = props;
  const [newLabel, setNewLabel] = React.useState<string>('');
  const [newDuration, setNewDuration] = React.useState<number>(0);
  const video = React.useRef(null);
  const [status, setStatus] = React.useState({ positionMillis: 0 });
  const [timestamp, setTimestamp] = React.useState<number>(timestampOverride !== undefined && selected ? timestampOverride : status.positionMillis + start)
  const [showLabelModal, setShowLabelModal] = React.useState<boolean>(false);

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
    const isAfterEventStart = timestamp >= ts;
    if (i < events.length-1) {
      return isAfterEventStart && timestamp < events[i+1].timestamp;
    }
    return isAfterEventStart;
  });

  const handleAddLabel = () => {
    handlePause();
    setShowLabelModal(true);
  };

  const videoPositionMillis = !shouldPlay && !selected ? timestamp - start : undefined;
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>{title}</Text>
          {selectedEvent && <><Button
            title={selectedEvent.label}
            onPress={() => {
              handlePause();
              setShowLabelModal(true);
            }}
          /><Button title="Delete" onPress={() => deleteLabel(selectedEvent.id)} /></>}
      </View>
      <Modal visible={showLabelModal} onRequestClose={() => setShowLabelModal(false)}>
          <TextInput
            placeholder="label"
            defaultValue={selectedEvent?.label}
            style={styles.input}
            onChangeText={setNewLabel}
          />
          <TextInput
            keyboardType="numeric"
            placeholder="duration (seconds)"
            defaultValue={selectedEvent ? (selectedEvent.durationMillis / 1000).toString() : undefined}
            style={styles.input}
            onChangeText={n => setNewDuration(parseFloat(n))}
          />
          <Button
            title="Save"
            onPress={() => {
              if (selectedEvent) {
                editLabel(selectedEvent.id, {
                  ...selectedEvent,
                  label: newLabel,
                  durationMillis: newDuration || selectedEvent.durationMillis,
                });
              } else {
                addLabel({ durationMillis: newDuration || 3000, label: newLabel, ts: timestamp });
              }
              setShowLabelModal(false)
              setNewLabel('');
              setNewDuration(0);
            }}
          />
          <Button
            title="Cancel"
            onPress={() => {
              setShowLabelModal(false)
              setNewLabel('');
              setNewDuration(0);
            }}
          />
      </Modal>
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
      <Button title="Add Label" onPress={handleAddLabel} />
    </View>
  );
}

const styles = StyleSheet.create({
  video: { width: 500, height: 300 },
  container: {
    flex: 1,
  },
  title: {
    textAlign: 'left',
    fontSize: 20,
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
});
