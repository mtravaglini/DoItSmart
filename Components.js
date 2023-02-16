import React from 'react';
import {
  Pressable,
  Text,
  View,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { signOut } from "firebase/auth";

// use custom style sheet
const styles = require('./Style.js');

export function scheduleTasks(unscheduled_tasks) {
  var scheduled_tasks = unscheduled_tasks;
  return scheduled_tasks;
}

export const Title = props => {
  return (
    <View style={styles.header}>
      <View style={{ flexDirection: "row", justifyContent: "center" }}>
        <Pressable style={{ position: "absolute", left: "1%", marginTop: "3%" }}
          onPress={() => props.navigation.goBack()}
        >
          <Text style={[styles.pageTitleText]}>
            <FontAwesome
              style={styles.headerIcon}
              name='arrow-circle-o-left'
              // color='cornflowerblue'
            />
          </Text>
        </Pressable>
        <Text style={[styles.pageTitleText]}>
          {props.title}
        </Text>
      </View>

      <Text style={styles.pageSubTitleText}>
        {props.name}
      </Text>
    </View>
  )
}

export const Footer = props => {
  return (
    <View style={styles.footer}>

      {/* <View style={{ flexDirection: "column", alignItems: "center" }}> */}
      <Pressable style={{paddingHorizontal: 10}}
          onPress={() => { props.navigation.navigate('Tasks', { uid: props.uid }) }}
        >
          <FontAwesome
            style={styles.footerIcon}
            name='tasks'
            // color='cornflowerblue'
          />
        <Text style={styles.footerText}>Tasks</Text>
        </Pressable>
      {/* </View> */}


      {/* <View style={{ flexDirection: "column", alignItems: "center" }}> */}
      <Pressable style={{paddingHorizontal: 10}}
        onPress={() => { props.navigation.navigate('Groups', { uid: props.uid }) }}
      >
        <FontAwesome
          style={styles.footerIcon}
          name='group'
          // color='cornflowerblue'
        />
      <Text style={styles.footerText}>Groups</Text>
      </Pressable>
      {/* </View> */}

      <View style={{ flexDirection: "column", alignItems: "center" }}>
      <Pressable style={{paddingHorizontal: 10}}
        onPress={() => { props.navigation.navigate('Resources', { uid: props.uid }) }}
      >
        <FontAwesome
          style={styles.footerIcon}
          name='car'
          // color='cornflowerblue'
        />
      <Text style={styles.footerText}>Resources</Text>
      </Pressable>
      </View>

      <View style={{ flexDirection: "column", alignItems: "center" }}>
      <Pressable style={{paddingHorizontal: 10}}
        onPress={() => { props.navigation.navigate('Profile', { uid: props.uid }) }}
      >
        <FontAwesome
          style={styles.footerIcon}
          name='user'
          // color='cornflowerblue'
        />
      <Text style={styles.footerText}>Profile</Text>
      </Pressable>
      </View>

      <View style={{ flexDirection: "column", alignItems: "center" }}>
      <Pressable style={{paddingHorizontal: 10}}
        onPress={() => {
          signOut(props.auth).then(() => {
            // Sign-out successful.
            //   alert("SIGNED OUT")
            props.navigation.navigate('Signin')
          }).catch((error) => {
            alert(error.message)
          });
        }}
      >
        <FontAwesome
          style={styles.footerIcon}
          name='sign-out'
          // color='cornflowerblue'
        />
      <Text style={styles.footerText}>SignOut</Text>
      </Pressable>
      </View>

    </View>
  )
}