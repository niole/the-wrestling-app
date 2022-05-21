import * as React from 'react';
import { Button, StyleSheet, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ClickableText } from '../../components';
import { MatchVideo } from '../types';

type Props = {
  goBack: () => void;
  doSelect: (newVideo: MatchVideo) => void;
};
export function ImportVideoView({ doSelect, goBack }: Props) {
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      exif: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      const foundDateTime = result.exif?.DateTime;
      const durationMillis = result.duration || 0;
      const title = '';
      const start = 0;

      doSelect({
        id: Math.random().toString(),
        uri: result.uri,
        start,
        events: [],
        durationMillis,
        title,
      });
    }
  };

  return (
    <View style={styles.container}>
      <ClickableText onPress={goBack}>
        Back
        </ClickableText>
        <View style={styles.pickVideoButton}>
          <Button title="Pick a Video" onPress={pickImage} />
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pickVideoButton: {
    flex: 1, alignItems: 'center', justifyContent: 'center'
  }
});
