import React, { useEffect, useState, useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { FontAwesome, FontAwesome5, Feather } from '@expo/vector-icons';
import Swipeable from 'react-native-gesture-handler/Swipeable';

import { db, auth } from './firebase.config';
import { signOut } from "firebase/auth";
import { doc, collection, query, getDoc, getDocs, setDoc, addDoc, deleteDoc, onSnapshot, where, orderBy } from "firebase/firestore";

// use custom style sheet
const styles = require('./Style.js');
// use custom components
import { Title, Footer } from './Components.js'
import { completeTask, deleteTask, scheduleTasks } from './Functions.js'

export function TasksScreen({ route, navigation }) {

  const insets = useSafeAreaInsets();
  const uid = route.params.uid;

  const [user, setUser] = useState('');
  const [tasks, setTasks] = useState([]);
  const [newTaskName, setNewTaskName] = useState('');
  const [isLoading, setLoading] = useState(true);
  const swipeableRef = useRef(null);

  // menu modal
  const [taskMenuVisible, setTaskMenuVisible] = useState(false);
  const [taskDisplayLimit, setTaskDisplayLimit] = useState(0);
  const [taskDisplayLimitText, setTaskDisplayLimitText] = useState("All");
  const [currTimeStamp, setCurrTimeStamp] = useState(Math.floor(Date.now()));
  const [includeCompleteTasks, setIncludeCompleteTasks] = useState(false);
  const [includeDeletedTasks, setIncludeDeletedTasks] = useState(false);
  const [includeReassignedTasks, setIncludeReassignedTasks] = useState(false);

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

    try {
      unsubscribe = onSnapshot(
        // var querySnapshot = await getDocs(
        query(
          collection(db, "Tasks"), where("userList", "array-contains", uid), orderBy('startDate'), orderBy('priority'), orderBy('name'))
        // )
        , (querySnapshot) => {
          const retrievedTasks = [];
          querySnapshot.forEach((doc) => {
            taskObj = doc.data();
            taskObj.id = doc.id;
            retrievedTasks.push(taskObj)
          })
          console.log("retrievedTasks", retrievedTasks)
          setTasks(tasks.concat(retrievedTasks))
          setLoading(false);
          // return retrievedTasks
        }
      )
    } catch (error) {
      console.error(error);
    }


    return function cleanup() {
      unsubscribe();
    };


  }, [])


  // set the task display limit
  const determineTaskDisplayLimit = (range) => {

    setTaskDisplayLimitText(range);

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

  const addTask = async () => {
    try {
      const timestamp = Math.floor(Date.now()) //serverTimestamp();
      const data = {
        name: newTaskName,
        creator: uid,
        assignee: uid,
        userList: [uid, uid],
        startDate: timestamp + (24 * 60 * 60 * 1000),
        endDate: timestamp + (24 * 2 * 60 * 60 * 1000),
        priority: 1,
        effort: 30,
        createdDate: timestamp,
        status: 'active',
        completedDate: 0
      }
      var docRef = await addDoc(collection(db, "Tasks"), data)
      // console.log("Document written with ID: ", docRef.id);
      scheduleTasks(uid);
      setNewTaskName('');
    } catch (error) {
      console.log(error);
    }
  }




  const TaskLine = props => {

    var item = props.item

    return (

      <Pressable
        style={[styles.listContainer,
        {
          // backgroundColor: (item.startDate < currTimeStamp && item.status != 'complete' ? "tomato" : "lightgreen") 
          backgroundColor: (item.status == 'complete' || item.status == 'deleted' || item.assignee != uid ? 'grey' : (item.startDate < currTimeStamp ? "tomato" : "lightgreen"))
        }]}
        onPress={() => navigation.navigate('TaskDetail', { uid: uid, taskId: item.id })}
      >
        <Text style={[styles.listText,
        (item.status == 'complete' || item.status == 'deleted' || item.assignee != uid ? { color: "black" } : null)
        ]} >
          {item.name}
        </Text>

        <Text style={[{ marginLeft: "5%" }]}>
          {new Date(item.startDate).toString().slice(16, 21)}-{new Date(item.endDate).toString().slice(16, 21)}
        </Text>
        {item.endDate - item.startDate >= 24 * 60 * 60 * 1000 ? (
          <Text>
            +{Math.floor((item.endDate - item.startDate) / (24 * 60 * 60 * 1000))}
          </Text>) : (null)}

        {item.status == 'complete' || item.completedDate > 0 ? (
          <Text style={[{ marginLeft: "5%", color: "black" }]} >
            <FontAwesome
              style={{ fontSize: 24 }}
              name='check'
            />
          </Text>) : (null)}

        {item.status == 'deleted' ? (
          <Text style={[{ marginLeft: "5%", color: "black" }]} >
            <FontAwesome
              style={{ fontSize: 24 }}
              name='trash-o'
            />
          </Text>) : (null)}

        {item.assignee != uid ? (
          <Text style={[{ marginLeft: "5%", color: "black" }]} >
            <FontAwesome
              style={{ fontSize: 24 }}
              name='user'
            />
          </Text>) : (null)}

        {item.startDate < currTimeStamp ? (
          <Text style={[{ marginLeft: "5%", color: "black" }]} >
            <FontAwesome
              style={{ fontSize: 24 }}
              name='hourglass-half'
            />
          </Text>) : (null)}



      </Pressable>

    )
  }





  /////////////////// Swipeable
  const leftSwipeActions = () => {
    return (
      <View
        style={styles.leftSwipeContainer}
      >
        <Text style={{
          color: "white", fontSize: 30,
        }}>
          <FontAwesome
            style={{ color: "white", fontSize: 24 }}
            name='calendar-check-o'
          />
        </Text>
        <Text style={{ color: "white", fontsize: 12, paddingLeft: "1%" }}>
          Complete Task
        </Text>
      </View>
    );
  };
  const rightSwipeActions = () => {
    return (
      <View
        style={styles.rightSwipeContainer}
      >
        <Text style={{ color: "white", fontsize: 12, paddingRight: "1%" }}>
          Delete Task
        </Text>
        <Text style={{
          color: "white", fontSize: 30,
        }}>
          <FontAwesome
            style={{ color: "white", fontSize: 24 }}
            name='trash-o'
          />
        </Text>
      </View>
    );
  };
  // const swipeFromLeftOpen = (itemId) => {
  //   alert('Swipe from left ' + itemId);
  // };
  // const swipeFromRightOpen = (itemId) => {
  //   alert('Swipe from right ' + itemId);
  // };
  /////////////////// Swipeable




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

          <TouchableOpacity
            style={{
              position: "absolute",
              right: "1%",
              zIndex: 3,
              // width: 100,
              marginTop: "2%",
              elevation: 3,
            }}
            onPress={() => {
              setTaskMenuVisible(true)
              setBackgroundOpacity(.33)
            }}
          >

            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>

              <View>
                <Text style={styles.headerIconText}>
                  {taskDisplayLimitText}
                </Text>

                {includeCompleteTasks ? (
                  <Text style={styles.headerIconText}>
                    Completed
                  </Text>) : (null)
                }

                {includeDeletedTasks ? (
                  <Text style={styles.headerIconText}>
                    Deleted
                  </Text>) : (null)
                }

                {includeReassignedTasks ? (
                  <Text style={styles.headerIconText}>
                    Re-Assigned
                  </Text>) : (null)
                }

              </View>

              <Text style={{
                fontSize: 30,
                paddingTop: 5
              }}>
                {/* <FontAwesome
                style={styles.headerIcon}
                name='bars'
              /> */}
                <Feather
                  style={[styles.headerIcon]}
                  name="filter" />
              </Text>

            </View>

          </TouchableOpacity>



          {/* modal for filter menu  */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={taskMenuVisible}
            onRequestClose={() => {
              setTaskMenuVisible(false)
              setBackgroundOpacity(1.0)
            }}>
            <View style={styles.modalMenuView}>
              <Pressable style={{ alignSelf: "flex-start", position: "absolute", left: "3%", marginTop: "1%" }}
                onPress={() => {
                  setTaskMenuVisible(false)
                  setBackgroundOpacity(1.0)
                }}
              >
                <Text style={[styles.pageTitleText]}>
                  <FontAwesome
                    style={styles.headerIcon}
                    name='arrow-circle-o-left'
                  // color='cornflowerblue'
                  />
                </Text>
              </Pressable>
              <Text style={[styles.pageTitleText, { marginBottom: "20%" }]}>Task View</Text>

              <Pressable
                style={[styles.secondaryButton, styles.menuButton]}
                onPress={() => {
                  determineTaskDisplayLimit('Day')
                  setTaskMenuVisible(false)
                  setBackgroundOpacity(1.0)
                }}>
                <Text style={[styles.secondaryButtonText]}>
                  <FontAwesome5
                    style={[styles.secondaryButtonText]}
                    // icon={faCalendarDay}
                    name='calendar-day'
                  // color='white'
                  /> Day
                </Text>
              </Pressable>

              <Pressable
                style={[styles.secondaryButton, styles.menuButton]}
                onPress={() => {
                  determineTaskDisplayLimit('Week')
                  setTaskMenuVisible(false)
                  setBackgroundOpacity(1.0)
                }}>
                <Text style={[styles.secondaryButtonText]}>
                  <FontAwesome5
                    style={[styles.secondaryButtonText]}
                    // icon={faCalendarDay}
                    name='calendar-week'
                  // color='white'
                  /> Week
                </Text>
              </Pressable>

              <Pressable
                style={[styles.secondaryButton, styles.menuButton]}
                onPress={() => {
                  determineTaskDisplayLimit('Month')
                  setTaskMenuVisible(false)
                  setBackgroundOpacity(1.0)
                }}>
                <Text style={[styles.secondaryButtonText]}>
                  <FontAwesome5
                    style={[styles.secondaryButtonText]}
                    // icon={faCalendarDay}
                    name='calendar'
                  // color='white'
                  /> Month
                </Text>
              </Pressable>

              <Pressable
                style={[styles.secondaryButton, styles.menuButton]}
                onPress={() => {
                  determineTaskDisplayLimit('All')
                  setTaskMenuVisible(false)
                  setBackgroundOpacity(1.0)
                }}>
                <Text style={[styles.secondaryButtonText]}>
                  <FontAwesome
                    style={[styles.secondaryButtonText]}
                    // icon={faCalendarDay}
                    name='tasks'
                  // color='white'
                  /> All
                </Text>
              </Pressable>

              <Text style={[styles.secondaryText, { marginTop: "15%" }]}>
                Tasks to Include:
              </Text>

              <View
                style={{ flexDirection: "row", marginTop: "1%" }}
              >
                <Switch
                  trackColor={{ false: 'grey', true: 'white' }}
                  thumbColor={includeCompleteTasks ? 'cornflowerblue' : 'lightgrey'}
                  ios_backgroundColor="grey"
                  onValueChange={() => setIncludeCompleteTasks(previousState => !previousState)}
                  value={includeCompleteTasks}
                />
                <Text style={[styles.secondaryText, { marginTop: "5%" }]}>Completed</Text>
              </View>

              <View style={{ flexDirection: "row", marginTop: "1%" }}>
                <Switch
                  trackColor={{ false: 'grey', true: 'white' }}
                  thumbColor={includeDeletedTasks ? 'cornflowerblue' : 'lightgrey'}
                  ios_backgroundColor="grey"
                  onValueChange={() => setIncludeDeletedTasks(previousState => !previousState)}
                  value={includeDeletedTasks}
                />
                <Text style={[styles.secondaryText, { marginTop: "5%" }]}>Deleted</Text>
              </View>

              <View style={{ flexDirection: "row", marginTop: "1%" }}>
                <Switch
                  trackColor={{ false: 'grey', true: 'white' }}
                  thumbColor={includeReassignedTasks ? 'cornflowerblue' : 'lightgrey'}
                  ios_backgroundColor="grey"
                  onValueChange={() => setIncludeReassignedTasks(previousState => !previousState)}
                  value={includeReassignedTasks}
                />
                <Text style={[styles.secondaryText, { marginTop: "5%" }]}>Re-Assigned</Text>
              </View>

            </View>
          </Modal>

          <Title
            title="Tasks"
            name={user.name}
            navigation={navigation}
            enableBack={false} />


          {/* <View style={[{ flexDirection: "row" }]}>
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

            <View style={{ flexDirection: "row", marginTop: "15%" }}>
              <Switch
                trackColor={{ false: 'grey', true: 'white' }}
                thumbColor={includeCompleteTasks ? 'cornflowerblue' : 'lightgrey'}
                ios_backgroundColor="grey"
                onValueChange={() => setIncludeCompleteTasks(previousState => !previousState)}
                value={includeCompleteTasks}
              />
              <Text style={styles.standardText}>Include Completed Tasks</Text>
            </View>

            <View style={{ flexDirection: "row", marginTop: "15%" }}>
              <Switch
                trackColor={{ false: 'grey', true: 'white' }}
                thumbColor={includeDeletedTasks ? 'cornflowerblue' : 'lightgrey'}
                ios_backgroundColor="grey"
                onValueChange={() => setIncludeDeletedTasks(previousState => !previousState)}
                value={includeDeletedTasks}
              />
              <Text style={styles.standardText}>Include Deleted Tasks</Text>
            </View>

            <View style={{ flexDirection: "row", marginTop: "15%" }}>
              <Switch
                trackColor={{ false: 'grey', true: 'white' }}
                thumbColor={includeReassignedTasks ? 'cornflowerblue' : 'lightgrey'}
                ios_backgroundColor="grey"
                onValueChange={() => setIncludeReassignedTasks(previousState => !previousState)}
                value={includeReassignedTasks}
              />
              <Text style={styles.standardText}>Include Re-Assigned Tasks</Text>
            </View>
          </View> */}




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
              style={[styles.inputButton, styles.btnSuccess, { opacity: (!newTaskName ? 0.5 : 1.0) }]}
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
              ListEmptyComponent={
                <Text style={[styles.listText, styles.txtSuccess, { alignSelf: "center" }]}>
                  All done! Add more tasks!
                </Text>}
              ItemSeparatorComponent={() =>
                <View style={{
                  flex: 1,
                  height: 1,
                  // backgroundColor: 'red',
                }} />}
              renderItem={({ item, index }) => {

                // check if task should be displayed
                // - date is within selected date range
                // - matches filter switch settings
                var displayTask = true;
                if ((taskDisplayLimit > 0 && item.startDate > taskDisplayLimit)
                  ||
                  (!includeCompleteTasks && item.status == 'complete')
                  ||
                  (!includeDeletedTasks && item.status == 'deleted')
                  ||
                  (!includeReassignedTasks && item.assignee != uid)
                ) {
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
                        <Text style={styles.textLabel}>{
                          new Date(item.startDate).toString().slice(0, 10)
                        }</Text>
                      ) : (
                        null
                      )}

                    {
                      // (displayTask && (item.status == 'deleted' || item.assignee != uid)) ?
                      (displayTask && (item.assignee != uid)) ?
                        (<View>

                          <TaskLine
                            item={item}>
                          </TaskLine>

                        </View>
                        ) : (

                          (displayTask) ?
                            (
                              <Swipeable
                                ref={ref => swipeableRef[index] = ref}
                                renderLeftActions={leftSwipeActions}
                                renderRightActions={rightSwipeActions}
                                onSwipeableRightOpen={() => {
                                  deleteTask(item)
                                  swipeableRef[index].close();
                                }}
                                // onSwipeableRightOpen={() => deleteTask(item.id)}
                                onSwipeableLeftOpen={() => {
                                  completeTask(item, index)
                                  swipeableRef[index].close();
                                }}
                                friction={1}
                              >

                                <TaskLine
                                  item={item}>
                                </TaskLine>

                              </Swipeable>
                            ) : (
                              null
                            )
                        )
                    }

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
