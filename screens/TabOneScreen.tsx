import * as React from 'react';
import { TextInput, Modal, Button, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import SelectDropdown from 'react-native-select-dropdown';

import { RootTabScreenProps } from '../types';
import { MatchView } from './matchview/MatchView';
import { Match } from './types';

const defaultData = {
  id: Math.random().toString(),
  title: 'A match',
  videos: [
    {
      title: 'the start of the match',
      id: '1',
      uri: 'http://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
      start: new Date('Thu, 03 Mar 2022 19:25:03 GMT').getTime(),
      durationMillis: 7000,
      events: [
        { id: Math.random().toString(), timestamp: new Date('Thu, 03 Mar 2022 19:25:04 GMT').getTime(), label: 'one', durationMillis: 1500 },
        { id: Math.random().toString(), timestamp: new Date('Thu, 03 Mar 2022 19:25:06 GMT').getTime(), label: 'one half', durationMillis: 1500 }
      ],
    },
    {
      id: '2',
      uri: 'http://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
      start: new Date('Thu, 03 Mar 2022 19:25:10 GMT').getTime(),
      durationMillis: 27000,
      events: [
        { id: Math.random().toString(), timestamp: new Date('Thu, 03 Mar 2022 19:25:10 GMT').getTime(), label: 'two', durationMillis: 1500 },
      ],
  }
  ],
  start: new Date('Thu, 03 Mar 2022 19:25:02 GMT').getTime(),
};

export default function TabOneScreen({ navigation }: RootTabScreenProps<'TabOne'>) {
  const [matches, setMatches] = React.useState<Match[]>([defaultData])
  const [selectedMatch, setSelectedMatch] = React.useState<Match | undefined>();
  const [creatingNewMatch, setCreateNewMatch] = React.useState<boolean>(false);
  const [showTimePicker, setShowTimePicker] = React.useState<boolean>(false);
  const [showDatePicker, setShowDatePicker] = React.useState<boolean>(false);
  const [newMatchTitle, setNewMatchTitle] = React.useState<string | undefined>();
  const [newMatchStartTime, setNewMatchStartTime] = React.useState<Date>(new Date());

  if (selectedMatch) {
    return <MatchView goBack={() => setSelectedMatch(undefined)} {...selectedMatch} />;
  }

  const resetModalState = () => {
    setCreateNewMatch(false);
    setNewMatchTitle(undefined);
    setNewMatchStartTime(new Date());
    setShowTimePicker(false);
    setShowDatePicker(false);
  };

  return (
    <View style={styles.container}>
        <Pressable onPress={() => setCreateNewMatch(true)}>
          <Text style={styles.dropdownButtonStyle}>Create New Match</Text>
        </Pressable>
        <Modal visible={creatingNewMatch} onRequestClose={() => setCreateNewMatch(false)}>
            <TextInput
              placeholder="match title"
              style={styles.input}
              onChangeText={setNewMatchTitle}
            />
            {showDatePicker && (
              <DateTimePicker
                testID="datePicker"
                value={newMatchStartTime}
                mode="date"
                is24Hour={true}
                onChange={(e: any, d?: Date) => {
                  setNewMatchStartTime(d || newMatchStartTime);
                  setShowDatePicker(false);
                }}
              />
            )}
            {showTimePicker && (
              <DateTimePicker
                testID="timePicker"
                value={newMatchStartTime}
                mode="time"
                is24Hour={true}
                onChange={(e: any, d?: Date) => {
                  setNewMatchStartTime(d || newMatchStartTime);
                  setShowTimePicker(false);
                }}
              />
            )}
            <Text>{`Date: ${newMatchStartTime ? newMatchStartTime.toISOString() : ''}`}</Text>
            <Button
              title="Date"
              onPress={() => {
                setShowDatePicker(true);
              }}
            />
            <Button
              title="Time"
              onPress={() => {
                setShowTimePicker(true);
              }}
            />
            <Button
              title="Save"
              disabled={!newMatchTitle}
              onPress={() => {
                setMatches([{
                  id: Math.random().toString(),
                  title: newMatchTitle!,
                  videos: [],
                  start: newMatchStartTime.getTime(),
                }, ...matches])
                resetModalState();
              }}
            />
            <Button
              title="Cancel"
              onPress={() => {
                resetModalState();
              }}
            />
        </Modal>
        <SelectDropdown
          defaultButtonText="View/Edit a Match"
          buttonStyle={styles.dropdownButtonStyle}
          data={matches}
          rowTextForSelection={item => item.title}
          onSelect={setSelectedMatch}
          buttonTextAfterSelection={item => item.title}
        />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  dropdownButtonStyle: {
    borderWidth: 1,
    borderColor: 'cadetblue',
    borderRadius: 3,
    backgroundColor: 'aquamarine',
    padding: 10,
    fontSize: 18
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
});
