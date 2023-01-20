import React, { useState } from 'react';
import { Alert, View, Text, Modal, StyleSheet, Pressable } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

// use custom style sheet
const styles = require('./Style.js');

export const HamburgerMenu = () => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.menuView}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          // Alert.alert('Modal has been closed.');
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.menuView}>

          <View style={styles.modalView}>

            <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
              <Pressable style={{ flex: .2 }}
                onPress={() => setModalVisible(false)}>
                <FontAwesome
                  style={[styles.hamburgerIcon,{marginLeft: 15}]}
                  color='cornflowerblue'
                  name='bars'
                />
              </Pressable>
              <View style={[styles.pageTitleContainer, { flex: .4 }]}>
                                <Text style={styles.pageTitleText}>
                                    Do It. Smart.
                                </Text>
        
                            </View>
              <View style={{ flex: .1 }}>
              </View>
            </View>


            <View style={styles.hamburgerItems}>
              <Text style={styles.modalText}>Tasks</Text>
              <Text style={styles.modalText}>Groups</Text>
              <Text style={styles.modalText}>Resources</Text>

              <Text style={styles.modalText}>Profile</Text>
              <Text style={styles.modalText}>Signout</Text>


            </View>


          </View>
        </View>
      </Modal>
      <Pressable style={{ paddingLeft: 15 }}
        onPress={() => setModalVisible(true)}>
        <FontAwesome
          style={styles.hamburgerIcon}
          name='bars'
          color='cornflowerblue'
        />
      </Pressable>
    </View>
  );
};

