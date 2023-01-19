import React, { useState, useEffect } from 'react';
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

  const uid = route.params.uid;
  const taskId = route.params.taskId;

  const [user, setUser] = useState('');
  const [origTask, setOrigTask] = useState({});
  const [task, setTask] = useState({});

  const [taskTitle, setTaskTitle] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskNotes, setTaskNotes] = useState('');
  const [taskPriority, setTaskPriority] = useState('');
  const [taskEffort, setTaskEffort] = useState('');

  // const [email, setEmail] = ('');
  // const [taskTitleSave, setTaskTitleSave] = ('');

  // get user 
  useEffect(() => {
    // console.log("Getting user", uid)
    async function getUser() {
      try {
        const docSnap = await getDoc(doc(db, "users", uid));
        setUser(docSnap.data());
      } catch (error) {
        console.error(error);
      }
    }
    getUser();
  }, [])

  // get task
  useEffect(() => {
    // console.log("Getting task", uid, taskId);
    async function getTask() {
      try {
        const docSnap = await getDoc(doc(db, "users", uid, "tasks", taskId));
        setOrigTask(docSnap.data());
        setTask(docSnap.data());
      } catch (error) {
        console.error(error);
      }
    }
    getTask();
  }, [])

  const taskChanged = () => {
    const keys1 = Object.keys(task);
    const keys2 = Object.keys(origTask);
    if (keys1.length !== keys2.length) {
      return true;
    }
    for (let key of keys1) {
      if (task[key] !== origTask[key]) {
        return true;
      }
    }
    return false;
  }



  const SaveTask = async () => {

    if (!taskChanged()) {
      // console.log("!taskChanged()")
      return 0
    }

    // console.log("Saving task", uid, taskId)

    try {
      await setDoc(doc(db, "users", uid, "tasks", taskId), task)
    } catch (error) {
      // const errorCode = error.code;
      const errorMessage = error.message;
      alert(errorMessage);
      return 1;
    }

    return 0;
  }
  // console.log("task", task)
  // console.log("origTask", origTask)
  // console.log("REFRESHED")


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
                <Text style={styles.pageSubTitleText}>
                  {user.name}
                </Text>
              </View>

              <View style={styles.inputFormContainer}>
                <Text style={styles.inputLabel}>Title (created on {new Date(task.createdAt).toString().slice(0, 24)})</Text>
                <TextInput
                  style={styles.input}
                  onChangeText={(newValue) => { setTask((prevState) => ({ ...prevState, title: newValue })) }}
                  value={task.title}
                  underlineColorAndroid='transparent'
                  autoCapitalize='none'
                />

                <Text style={styles.inputLabel}>Assigned To</Text>
                <TextInput
                  style={styles.input}
                  onChangeText={(newValue) => { setTask((prevState) => ({ ...prevState, assignee: newValue })) }}
                  value={task.assignee}
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
                  onChangeText={(newValue) => { setTask((prevState) => ({ ...prevState, notes: newValue })) }}
                  value={task.notes}
                  underlineColorAndroid='transparent'
                  autoCapitalize='none'
                />

                <Text style={styles.inputLabel}>Start Date</Text>
                <TextInput
                  style={styles.input}
                  onChangeText={(newValue) => { setTask((prevState) => ({ ...prevState, startDate: newValue })) }}
                  value={task.startDate == undefined ?
                    new Date(Date.now()).toString().slice(0, 24)
                    :
                    new Date(task.startDate).toString().slice(0, 24)}
                  underlineColorAndroid='transparent'
                  autoCapitalize='none'
                />

                <Text style={styles.inputLabel}>End Before Date</Text>
                <TextInput
                  style={styles.input}
                  onChangeText={(newValue) => { setTask((prevState) => ({ ...prevState, endDate: newValue })) }}
                  value={task.endDate == undefined ?
                    new Date(Date.now()).toString().slice(0, 24)
                    :
                    new Date(task.endDate).toString().slice(0, 24)}
                  underlineColorAndroid='transparent'
                  autoCapitalize='none'
                />

                <View style={{ flexDirection: "row" }}>
                  <View style={{ flexDirection: "column" }}>
                    <Text style={styles.inputLabel}>Priority</Text>
                    <TextInput
                      style={[styles.input]}
                      onChangeText={(newValue) => { setTask((prevState) => ({ ...prevState, priority: +newValue })) }}
                      value={task.priority?.toString()}
                      underlineColorAndroid='transparent'
                      autoCapitalize='none'
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={{ flexDirection: "column" }}>
                    <Text style={styles.inputLabel}>Effort</Text>
                    <TextInput
                      style={[styles.input]}
                      onChangeText={(newValue) => { setTask((prevState) => ({ ...prevState, effort: +newValue })) }}
                      value={task.effort?.toString()}
                      underlineColorAndroid='transparent'
                      autoCapitalize='none'
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <Text style={styles.inputLabel}>Group</Text>
                <TextInput
                  style={styles.input}
                  // onChangeText={(taskTitle) => setNewData(taskTitle)}
                  value={task.taskGroup}
                  underlineColorAndroid='transparent'
                  autoCapitalize='none'
                />

                <Text style={styles.inputLabel}>Resources</Text>
                <TextInput
                  style={styles.input}
                  // onChangeText={(taskTitle) => setNewData(taskTitle)}
                  value={task.taskResources}
                  underlineColorAndroid='transparent'
                  autoCapitalize='none'
                />

                <View style={{ alignItems: "center" }}>
                  <TouchableOpacity style={[styles.mainButton,{ opacity: (!taskChanged()) ? 0.5 : 1.0 }]}
                    disabled={!taskChanged()}
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
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
}
