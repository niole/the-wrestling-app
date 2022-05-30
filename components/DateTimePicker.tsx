import * as React from 'react';
import { KeyboardAvoidingView, TextInput, StyleSheet, Button, Text, View } from 'react-native';
import CommDateTimePicker from '@react-native-community/datetimepicker';
import { formatDateOnly, formatTime } from '../utils';
import { Picker } from '@react-native-picker/picker';

export type Props = {
  defaultDate?: Date;
  onChange: (date: Date) => void;
};

const parseNumber = (n: string): number | null => {
  try {
    const int = parseInt(n);
    if (!isNaN(int)) {
      return int;
    }
  } catch (e) {
    console.error(e);
  }
  return null;
};
const getTime = (date: Date): { hour: number, minute: number, second: number } => {
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  return { hour, minute, second };
};

export function DateTimePicker({ onChange, defaultDate }: Props) {
  const [date, setDate] = React.useState<Date>(defaultDate || new Date());
  const [showTimePicker, setShowTimePicker] = React.useState<boolean>(false);
  const [showDatePicker, setShowDatePicker] = React.useState<boolean>(false);

  React.useEffect(() => {
    onChange(date);
  }, [date]);

  const time = getTime(date);
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
      <View style={styles.container}>
        <Button
          title={formatDateOnly(date.getTime())}
          style={styles.dateButton}
          onPress={() => {
            setShowDatePicker(true);
          }}
        />
      <View style={styles.timeContainer}>
          <Picker
            selectedValue={time.hour}
            style={{ width: 100 }}
            onValueChange={(h, itemIndex) => {
                  const hours = parseNumber(h);
                  if (hours !== null) {
                    date.setHours(hours);
                    setDate(new Date(date));
                  }
            }}>
            {Array(24).fill(1).map((n, i) => <Picker.Item key={(n+i).toString()} label={(n+i).toString()} value={n+i} />)}
          </Picker>
          <Text style={styles.colons}>:</Text>
          <Picker
            style={{ width: 100 }}
            selectedValue={time.minute}
            onValueChange={(m, itemIndex) => {
                  const minutes = parseNumber(m);
                  if (minutes !== null) {
                    date.setMinutes(minutes);
                    setDate(new Date(date));
                  }
            }}>
            {Array(59).fill(1).map((n, i) => <Picker.Item key={(n+i).toString()} label={(n+i).toString()} value={n+i} />)}
          </Picker>
          <Text style={styles.colons}>:</Text>
          <Picker
            style={{ width: 100 }}
            selectedValue={time.second}
            onValueChange={(s, itemIndex) => {
                  const seconds = parseNumber(s);
                  if (seconds !== null) {
                    date.setSeconds(seconds);
                    setDate(new Date(date));
                  }
            }}>
            {Array(59).fill(1).map((n, i) => <Picker.Item key={(n+i).toString()} label={(n+i).toString()} value={n+i} />)}
          </Picker>
      </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  dateButton: {
    flex: 1,
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  colons: {
    fontSize: 20,
  }
});
