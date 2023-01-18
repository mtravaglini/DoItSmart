import React, { useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { db } from './firebase.config';
import { doc, collection, query, getDoc, setDoc, onSnapshot, orderBy } from "firebase/firestore";

// use custom style sheet
const styles = require('./Style.js');



export function TaskDetailScreen({ route, navigation }) {

  const [taskObj, setTaskObj] = useState(route.params.item);
  const [taskTitle, setTaskTitle] = useState(route.params.item.title);
  const [taskAssignee, setTaskAssignee] = useState(route.params.item.assignee);
  const [taskNotes, setTaskNotes] = useState(route.params.item.notes);
  const [taskPriority, setTaskPriority] = useState(route.params.item.priority);
  const [taskEffort, setTaskEffort] = useState(route.params.item.effort);

  const email = route.params.item.email;
  const taskTitleSave = route.params.item.title;

  const SaveTask = async () => {

    var newTaskObj = taskObj;
    delete     newTaskObj.email;
    delete     newTaskObj.title;

    newTaskObj.assignee = taskAssignee
    newTaskObj.notes = taskNotes
    newTaskObj.priority = taskPriority
    newTaskObj.effort = taskEffort

    try {
      await setDoc(doc(db, "users", email, "tasks", taskTitleSave), newTaskObj)
    } catch (error) {
      // const errorCode = error.code;
      const errorMessage = error.message;
      // console.log("Sign in failed");
      // console.log(errorCode);    // ..
      // console.log(errorMessage);    // ..
      // setScreenMsg(errorMessage);
      alert(errorMessage);
      return 1;
    }

    return 0;
  }

  return (
    <SafeAreaView style={[styles.safeView]}>
      <ScrollView style={{ height: '100%' }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View>

              <View style={styles.pageTitleContainer}>
                <Text style={styles.pageTitleText}>
                  Task Detail
                </Text>
              </View>

              <View style={styles.inputFormContainer}>
                <Text style={styles.inputLabel}>Title (created {new Date(taskObj.createdAt).toString().slice(0, 24)})</Text>
                <TextInput
                  style={styles.input}
                  onChangeText={(newTaskTitle) => { setTaskTitle(newTaskTitle) }}
                  value={taskTitle}
                  underlineColorAndroid='transparent'
                  autoCapitalize='none'
                />

                <Text style={styles.inputLabel}>Assigned To</Text>
                <TextInput
                  style={styles.input}
                  onChangeText={(newTaskAssignee) => { setTaskAssignee(newTaskAssignee) }}
                  value={taskAssignee}
                  underlineColorAndroid='transparent'
                  autoCapitalize='none'
                />

                <Text style={styles.inputLabel}>Notes</Text>
                <TextInput
                  style={[styles.input, {
                    height: 150,
                    textAlignVertical: "top" // android fix for centering it at the top-left corner 
                  }]}
                  multiline={true} // ios fix for centering it at the top-left corner 
                  onChangeText={(newTaskNotes) => { setTaskNotes(newTaskNotes) }}
                  value={taskNotes}
                  underlineColorAndroid='transparent'
                  autoCapitalize='none'
                />

                <Text style={styles.inputLabel}>Start Date</Text>
                <TextInput
                  style={styles.input}
                  // onChangeText={(taskTitle) => setNewData(taskTitle)}
                  value={taskObj.startDate == undefined ?
                    new Date(Date.now()).toString().slice(0, 24)
                    :
                    new Date(taskObj.startDate).toString().slice(0, 24)}
                  underlineColorAndroid='transparent'
                  autoCapitalize='none'
                />

                <Text style={styles.inputLabel}>End Before Date</Text>
                <TextInput
                  style={styles.input}
                  // onChangeText={(taskTitle) => setNewData(taskTitle)}
                  value={taskObj.endDate == undefined ?
                    new Date(Date.now()).toString().slice(0, 24)
                    :
                    new Date(taskObj.endDate).toString().slice(0, 24)}
                  underlineColorAndroid='transparent'
                  autoCapitalize='none'
                />

                <View style={{ flexDirection: "row" }}>
                  <View style={{ flexDirection: "column" }}>
                    <Text style={styles.inputLabel}>Priority</Text>
                    <TextInput
                      style={[styles.input]}
                      onChangeText={(taskPriority) => setTaskPriority(taskPriority)}
                      value={taskPriority}
                      underlineColorAndroid='transparent'
                      autoCapitalize='none'
                    />
                  </View>

                  <View style={{ flexDirection: "column" }}>
                    <Text style={styles.inputLabel}>Effort</Text>
                    <TextInput
                      style={[styles.input]}
                      onChangeText={(taskEffort) => setTaskEffort(taskEffort)}
                      value={taskEffort}
                      underlineColorAndroid='transparent'
                      autoCapitalize='none'
                    />
                  </View>
                </View>

                <Text style={styles.inputLabel}>Group</Text>
                <TextInput
                  style={styles.input}
                  // onChangeText={(taskTitle) => setNewData(taskTitle)}
                  value={taskObj.taskGroup}
                  underlineColorAndroid='transparent'
                  autoCapitalize='none'
                />

                <Text style={styles.inputLabel}>Resources</Text>
                <TextInput
                  style={styles.input}
                  // onChangeText={(taskTitle) => setNewData(taskTitle)}
                  value={taskObj.taskResources}
                  underlineColorAndroid='transparent'
                  autoCapitalize='none'
                />

                <TouchableOpacity style={styles.mainButton}
                  onPress={async () => {
                    await SaveTask().then(
                      (result) => {
                        if (result == 0) {
                          navigation.goBack();
                        }
                      }
                    )
                  }}
                >
                  <Text
                    style={styles.buttonText}
                  >Save
                  </Text>
                </TouchableOpacity>

              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
}
