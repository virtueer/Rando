import * as React from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import socket from '../socket';

const Screen = ({navigation}) => {
  socket.on('matched', () => {
    navigation.navigate('Chat');
  });

  return (
    <View style={[styles.container]}>
      <View>
        <ActivityIndicator size="large" color="#00ff00" />
      </View>
      <Text>Waiting for someone who wanna chat</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Screen;
