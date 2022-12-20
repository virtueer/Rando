import React, {useEffect, useState, useRef} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  ScrollView,
} from 'react-native';
import socket from '../socket';

const Screen = ({navigation}) => {
  const lipsum = 'lorem ipsun';

  const scrollview = useRef();

  socket.off('message');
  socket.once('message', message => {
    console.log('message');
    setMessages([
      ...messages,
      {
        mine: false,
        message,
      },
    ]);
  });

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  function onSend() {
    console.log('onSend');
    socket.emit('message', message);

    setMessages([
      ...messages,
      {
        mine: true,
        message,
      },
    ]);
    setMessage('');
  }

  const renderMessages = () =>
    messages.map((m, i) => {
      return (
        <Text
          key={i}
          style={[styles.message, m.mine ? styles.mine : styles.your]}>
          {m.message}
        </Text>
      );
    });

  return (
    <View style={{flexDirection: 'column', flex: 1}}>
      <ScrollView
        ref={scrollview}
        onContentSizeChange={() =>
          scrollview.current.scrollToEnd({animated: true})
        }>
        <View style={[styles.container]}>{renderMessages()}</View>
      </ScrollView>
      <View style={[styles.bottom]}>
        <TextInput
          style={styles.input}
          multiline={true}
          numberOfLines={2}
          value={message}
          onChangeText={setMessage}
        />
        <View style={[styles.send]}>
          <Button title="Send" color="#f194ff" onPress={onSend} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 5,
  },
  message: {
    color: 'red',
    padding: 10,
    maxWidth: '80%',
    marginTop: 10,
    borderRadius: 10,
  },
  mine: {
    backgroundColor: 'white',
    marginLeft: 'auto',
    marginRight: 10,
  },
  your: {
    backgroundColor: 'wheat',
    marginRight: 'auto',
    marginLeft: 10,
  },
  bottom: {
    flexDirection: 'row',
    height: 'auto',
    maxHeight: 70,
    borderWidth: 1,
    backgroundColor: 'pink',
  },
  input: {
    flex: 1,
    marginHorizontal: 5,
  },
  send: {
    padding: 5,
    marginRight: 5,
    justifyContent: 'center',
  },
});

export default Screen;
