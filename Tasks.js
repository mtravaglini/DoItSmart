import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { db, auth } from './firebase.config';
import { signOut } from "firebase/auth";
import { doc, collection, query, getDoc, getDocs, setDoc, addDoc, deleteDoc, onSnapshot, where, orderBy } from "firebase/firestore";

// use custom style sheet
const styles = require('./Style.js');
// use custom components
import { Title, Footer } from './Components.js'
import { ReloadInstructions } from 'react-native/Libraries/NewAppScreen';
import { setStatusBarBackgroundColor } from 'expo-status-bar';

export function TasksScreen({ route, navigation }) {

  const insets = useSafeAreaInsets();
  const uid = route.params.uid;

  const [user, setUser] = useState('');
  const [tasks, setTasks] = useState([]);
  const [newTaskName, setNewTaskName] = useState('');
  const [isLoading, setLoading] = useState(true);

  // menu modal
  const [taskMenuVisible, setTaskMenuVisible] = useState(false);
  const [taskDisplayLimit, setTaskDisplayLimit] = useState(0);
  const [currTimeStamp, setCurrTimeStamp] = useState(Math.floor(Date.now()));

  // opacity
  const [backgroundOpacity, setBackgroundOpacity] = useState(1.0);

  // get user 
  useEffect(() => {
    async function getUser() {
      try {
        const docSnap = await getDoc(doc(db, "Users", uid));
        setUser(docSnap.data());
      } catch (error) {
        console.error(error);
      }
    }
    getUser();
  }, [])

  // get tasks
  useEffect(() => {
    var unsubscribe;
    var taskObj;
    async function getTasks() {
      try {
        unsubscribe = onSnapshot(
          query(
            collection(db, "Tasks"), where("assignee", "==", uid), orderBy('startDate'), orderBy('priority')), (querySnapshot) => {
              const retrievedTasks = [];
              querySnapshot.forEach((doc) => {
                taskObj = doc.data();
                taskObj.id = doc.id;
                retrievedTasks.push(taskObj)
              })
              setTasks(retrievedTasks)
              setLoading(false);
            })
      } catch (error) {
        console.error(error);
      }
    }
    getTasks();
    return function cleanup() {
      unsubscribe();
    };
  }, [])


  // set the task display limit
  const determineTaskDisplayLimit = (range) => {

    switch (range) {
      case 'All':
        setTaskDisplayLimit(0);
        break;
      case 'Day':
        setTaskDisplayLimit(currTimeStamp + 24 * 60 * 60 * 1000);
        break;
      case 'Week':
        setTaskDisplayLimit(currTimeStamp + 24 * 60 * 60 * 1000 * 7);
        break;
      case 'Month':
        setTaskDisplayLimit(currTimeStamp + 24 * 60 * 60 * 1000 * 31);
        break;
    }
  }



  // add a task
  const checkAddTask = () => {
    // check we have one to add
    if (newTaskName && newTaskName.length > 0) {

      //check if it already exists
      if (tasks.some(el => newTaskName == el.name)) {

        Alert.alert("Task " + newTaskName + " already exists.",
          "Consider choosing a different name.",
          [{
            text: "Create anyways!",
            onPress: () => addTask()
          },
          {
            text: "Cancel"
          }]
        )

      } else {
        addTask()
      }
    }
  }

  const addTask = () => {
    try {
      const timestamp = Math.floor(Date.now()) //serverTimestamp();
      const data = {
        name: newTaskName,
        creator: uid,
        assignee: uid,
        startDate: timestamp,
        endDate: timestamp + (24 * 60 * 60 * 1000),
        priority: 1,
        effort: 30,
        createdDate: timestamp
      }
      addDoc(collection(db, "Tasks"), data)
      setNewTaskName('');
    } catch (error) {
      alert(error);
    }
  }


  // delete a task
  const deleteTask = async (taskId) => {
    try {

      var querySnapshot;

      // delete the tasks's TaskGroups subcollection
      querySnapshot = await getDocs(collection(db, "Tasks", taskId, "TaskGroups"))
      querySnapshot.forEach((doc) => {
        deleteDoc(doc.ref)
      })

      // delete the task's TaskResources subcollection
      querySnapshot = await getDocs(collection(db, "Tasks", taskId, "TaskResources"))
      querySnapshot.forEach((doc) => {
        deleteDoc(doc.ref)
      })

      // delete Tasks doc
      await deleteDoc(doc(db, "Tasks", taskId));
    } catch (error) {
      alert(error);
    }
  }

  return (
    <View style={[styles.safeView, {
      marginTop: insets.top,
      paddingBottom: insets.bottom,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      opacity: backgroundOpacity
    }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* <TouchableWithoutFeedback onPress={Keyboard.dismiss}> */}
        <View style={{ flex: 1 }}>

          {/* ///////////////////////////////////////////////////// */}
          <Pressable style={{
            position: "absolute",
            right: 0,
            zIndex: 3,
            width: "10%",
            // elevation: 3
          }}
            onPress={() => {
              setTaskMenuVisible(true)
              setBackgroundOpacity(.33)
            }}
          >
            <Text style={{
              color: "white", fontSize: 30,
            }}>
              <FontAwesome
                style={styles.headerIcon}
                name='bars'
              />            </Text>
          </Pressable>



          {/* modal for menu  */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={taskMenuVisible}
            onRequestClose={() => {
              setTaskMenuVisible(false)
              setBackgroundOpacity(1.0)
            }}>
            <View style={styles.modalMenuView}>

              <Text style={[styles.pageTitleText, { marginBottom: "20%" }]}>Task View</Text>

              <Pressable
                style={[styles.mainButton, styles.menuButton]}
                onPress={() => {
                  determineTaskDisplayLimit('Day')
                  setTaskMenuVisible(false)
                  setBackgroundOpacity(1.0)
                }}>
                <Text style={[styles.buttonText]}>
                  <FontAwesome5
                    style={[styles.buttonText]}
                    // icon={faCalendarDay}
                    name='calendar-day'
                  // color='white'
                  /> Day
                </Text>
              </Pressable>

              <Pressable
                style={[styles.mainButton, styles.menuButton]}
                onPress={() => {
                  determineTaskDisplayLimit('Week')
                  setTaskMenuVisible(false)
                  setBackgroundOpacity(1.0)
                }}>
                <Text style={[styles.buttonText]}>
                  <FontAwesome5
                    style={[styles.buttonText]}
                    // icon={faCalendarDay}
                    name='calendar-week'
                  // color='white'
                  /> Week
                </Text>
              </Pressable>

              <Pressable
                style={[styles.mainButton, styles.menuButton]}
                onPress={() => {
                  determineTaskDisplayLimit('Month')
                  setTaskMenuVisible(false)
                  setBackgroundOpacity(1.0)
                }}>
                <Text style={[styles.buttonText]}>
                  <FontAwesome5
                    style={[styles.buttonText]}
                    // icon={faCalendarDay}
                    name='calendar'
                  // color='white'
                  /> Month
                </Text>
              </Pressable>

              <Pressable
                style={[styles.mainButton, styles.menuButton]}
                onPress={() => {
                  determineTaskDisplayLimit('All')
                  setTaskMenuVisible(false)
                  setBackgroundOpacity(1.0)
                }}>
                <Text style={[styles.buttonText]}>
                  <FontAwesome
                    style={[styles.buttonText]}
                    // icon={faCalendarDay}
                    name='tasks'
                  // color='white'
                  /> All
                </Text>
              </Pressable>

            </View>
          </Modal>
          {/* ///////////////////////////////////////////////////// */}

          <Title
            title="Tasks"
            name={user.name}
            navigation={navigation} />

          <View style={styles.inputBtnFormContainer}>
            <TextInput
              style={styles.inputShort}
              placeholder="task quick add"
              onChangeText={(newTaskName) => setNewTaskName(newTaskName)}
              value={newTaskName}
              underlineColorAndroid='transparent'
              autoCapitalize='none'
            />
            <TouchableOpacity
              style={[styles.inputButton, { opacity: (!newTaskName ? 0.5 : 1.0) }]}
              disabled={!newTaskName}
              onPress={() => {
                Keyboard.dismiss();
                checkAddTask()
              }}
            >
              <Text
                style={styles.buttonText}
              >Add</Text>
            </TouchableOpacity>
          </View>
          {/* show acivity indicator when waiting to return to tasks screen */}
          {isLoading ? (
            <ActivityIndicator style={styles.standardText} size="large" />
          ) : (
            // <FlatList style={{ height: "73%", marginBottom: 15 }}
            <FlatList
              data={tasks}
              ListEmptyComponent={<Text style={[styles.listText, styles.txtSuccess, { alignSelf: "center" }]}>
                All done! Add more tasks!
              </Text>}
              renderItem={({ item, index }) => {

                // check if task date is within selected date range
                var displayTask = true;
                if (taskDisplayLimit > 0 && item.startDate > taskDisplayLimit) {
                  displayTask = false;
                }

                // display task date only if different to last task 
                var displayDate = true;
                var curr, prev
                if (index > 0) {
                  curr = new Date(item.startDate).toString().slice(0, 10)
                  prev = new Date(tasks[(index - 1)].startDate).toString().slice(0, 10)
                  displayDate = (curr != prev)
                }

                return (
                  <View>
                    {(displayDate && displayTask) ?
                      (
                        <Text style={styles.inputLabel}>{
                          new Date(item.startDate).toString().slice(0, 10)
                        }</Text>
                      ) : (
                        ''
                      )}

                    {(displayTask) ?
                      (<Pressable
                        style={[styles.listContainer, {backgroundColor: (item.startDate < currTimeStamp ? "tomato" : "lightgreen")}]}
                        onPress={() => navigation.navigate('TaskDetail', { uid: uid, taskId: item.id })}
                      >
                        <FontAwesome
                          style={styles.listDelIcon}
                          name='trash-o'
                          color='lightgrey'
                          onPress={() => deleteTask(item.id)} />
                        {/* <View > */}
                        <Text style={styles.listText} >
                          {item.name}
                        </Text>
                        {/* </View> */}
                      </Pressable>
                      ) : ('')}
                  </View>
                )
              }}
            />
          )}

          <Footer auth={auth}
            navigation={navigation}
            uid={uid} />

        </View>
        {/* </TouchableWithoutFeedback> */}
      </KeyboardAvoidingView>
    </View>
  );
}
