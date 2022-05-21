import * as React from 'react';
import { StyleSheet, Button, Text, View } from 'react-native';
import CommDateTimePicker from '@react-native-community/datetimepicker';

export type Props = {
  defaultDate?: Date;
  onChange: (date: Date) => void;
};

export function DateTimePicker({ onChange, defaultDate }: Props) {
  const [date, setDate] = React.useState<Date>(defaultDate || new Date());
  const [showTimePicker, setShowTimePicker] = React.useState<boolean>(false);
  const [showDatePicker, setShowDatePicker] = React.useState<boolean>(false);

  return (
    <View>
      {showDatePicker && (
        <CommDateTimePicker
          testID="datePicker"
          value={date}
          mode="date"
          is24Hour={true}
          onChange={(e: any, d?: Date) => {
            setDate(d || date);
            setShowDatePicker(false);
          }}
        />
      )}
      {showTimePicker && (
        <CommDateTimePicker
          testID="timePicker"
          value={date}
          mode="time"
          is24Hour={true}
          onChange={(e: any, d?: Date) => {
            setDate(d || date);
            setShowTimePicker(false);
          }}
        />
      )}
      <Text>{`Date: ${date.toISOString()}`}</Text>
      <View style={styles.container}>
        <Button
          title="Date"
          style={styles.dateButton}
          onPress={() => {
            setShowDatePicker(true);
          }}
        />
        <Button
          title="Time"
          style={styles.dateButton}
          onPress={() => {
            setShowTimePicker(true);
          }}
        />
      </View>
      <Button title="Submit" onPress={() => onChange(date)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  dateButton: {
    flex: 1,
  }
});
