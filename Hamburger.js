import React, { useState } from 'react';
import { Alert, View, Text, Modal, StyleSheet, Pressable } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

// use custom style sheet
const styles = require('./Style.js');

export const HamburgerMenu = () => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.centeredView}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Hello World!</Text>
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => setModalVisible(!modalVisible)}>
              <Text style={styles.textStyle}>Hide Modal</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <Pressable
        onPress={() => setModalVisible(true)}>
        <FontAwesome
          style={styles.hamburgerIcon}
          name='bars'
        />
      </Pressable>
    </View>
  );
};

