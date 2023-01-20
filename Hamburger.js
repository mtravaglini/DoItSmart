import React, { useState } from 'react';
import { 
  Modal, 
  Pressable,
  Text, 
  TouchableOpacity,
  View, 
 } from 'react-native';

 import { FontAwesome } from '@expo/vector-icons';

// use custom style sheet
const styles = require('./Style.js');

// export const HamburgerMenu = () => {
  export function HamburgerMenu(navigation, route) {
    const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.menuView}>
      <Modal
        onBackdropPress={() => {
          // Alert.alert('Modal has been closed.');
          setModalVisible(false);
        }}
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          // Alert.alert('Modal has been closed.');
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.menuView}>

          <View style={styles.modalMenuView}>

            <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
              <Pressable style={{ flex: .2 }}
                onPress={() => setModalVisible(false)}>
                <FontAwesome
                  style={[styles.hamburgerIcon, { marginLeft: 15 }]}
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

              <TouchableOpacity 
                onPress={() => { navigation.navigate('Tasks', {uid: uid}) }}
              >
                <Text style={styles.menuText}>Tasks</Text>
              </TouchableOpacity>



              <Text style={styles.menuText}>Groups</Text>
              <Text style={styles.menuText}>Resources</Text>

              <Text style={styles.menuText}>Profile</Text>
              <Text style={styles.menuText}>Signout</Text>


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

