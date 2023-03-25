import { Alert } from 'react-native';
import { doc, collection, collectionGroup, query, addDoc, getDoc, getDocs, setDoc, deleteDoc, onSnapshot, where, orderBy, DocumentReference, queryEqual } from "firebase/firestore";
import { db, auth } from './firebase.config';

// define function to complete a task
export const completeTask = async (taskObj) => {

  taskObj.status = 'complete'
  taskObj.completedDate = Math.floor(Date.now())

  try {
    await setDoc(doc(db, "Tasks", taskObj.id), taskObj)
  } catch (error) {
    console.log(error.message);
  }

}

// define function to un-complete a task
export const unCompleteTask = async (taskObj) => {

  taskObj.status = 'active'
  taskObj.completedDate = 0;

  try {
    await setDoc(doc(db, "Tasks", taskObj.id), taskObj)
  } catch (error) {
    console.log(error.message);
  }

}

// define function to mark the task as deleted
export const deleteTask = async (taskObj) => {

  // if task already in deleted status, confirm to PERMANENTLY delete it
  if (taskObj.status == 'deleted') {

    Alert.alert("DANGER - PERMANENTLY delete " + taskObj.name,
      "Are you sure?",
      [{
        text: "Delete",
        onPress: () => purgeTask(taskObj.id),

      },
      {
        text: "Cancel"
      }]
    )

    return
  }
  taskObj.status = 'deleted'
  taskObj.deletedDate = Math.floor(Date.now())

  try {
    await setDoc(doc(db, "Tasks", taskObj.id), taskObj)
  } catch (error) {
    console.log(error.message);
  }

}

// define function to un-delete a task
export const unDeleteTask = async (taskObj) => {

  // console.log("unDeleteTask triggered")
  // mark the task as active or complete (depending on previous status)
  if (taskObj.completedDate > 0) {
    taskObj.status = 'complete'
  } else {
    taskObj.status = 'active'
  }

  taskObj.deletedDate = 0;

  try {
    await setDoc(doc(db, "Tasks", taskObj.id), taskObj)
  } catch (error) {
    console.log(error.message);
  }

}

// define function to permanently delete a task
export const purgeTask = async (taskId) => {
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
    console.log(error.message);
  }
}

// define function to delete a group
export const deleteGroup = async (groupId) => {
  try {
    var querySnapshot;

    // delete the group's GroupUsers subcollection
    querySnapshot = await getDocs(collection(db, "Groups", groupId, "GroupUsers"))
    querySnapshot.forEach((doc) => {
      deleteDoc(doc.ref)
    })

    // delete the group's GroupResources subcollection
    querySnapshot = await getDocs(collection(db, "Groups", groupId, "GroupResources"))
    querySnapshot.forEach((doc) => {
      deleteDoc(doc.ref)
    })

    // delete the group from any tasks
    querySnapshot = await getDocs(query(collectionGroup(db, "TaskGroups"), where("groupId", "==", groupId)))
    querySnapshot.forEach((doc) => {
      deleteDoc(doc.ref)
    })

    // delete any outstanding invitations to the group
    querySnapshot = await getDocs(query(collection(db, "GroupInvites"), where("groupId", "==", groupId)))
    querySnapshot.forEach((doc) => {
      deleteDoc(doc.ref)
    })

    // delete the Group doc
    await deleteDoc(doc(db, "Groups", groupId));
  } catch (error) {
    console.log(error.message);
  }
}

// define function to delete a resource
export const deleteResource = async (resourceId) => {
  try {

    // delete the resource from any groups
    querySnapshot = await getDocs(query(collectionGroup(db, "GroupResources"), where("resourceId", "==", resourceId)))
    querySnapshot.forEach((doc) => {
      deleteDoc(doc.ref)
    })

    // delete the resource from any tasks
    querySnapshot = await getDocs(query(collectionGroup(db, "TaskResources"), where("resourceId", "==", resourceId)))
    querySnapshot.forEach((doc) => {
      deleteDoc(doc.ref)
    })

    // delete the Resource doc
    await deleteDoc(doc(db, "Resources", resourceId));
  } catch (error) {
    console.log(error.message);
  }
}

// define the Scheduling Eninge function
export const scheduleTasks = async (userId) => {

  // console.log("***************************")
  // console.log("***************************")
  // console.log("*************************** SCHEDULING ENGINE Entered Function *********************************************************************")
  // console.log("***************************")
  // console.log("***************************")
  // console.log("")
  // console.log("")

  // get all users in all groups for which current user is a member
  var retrievedUserGroupNames = await getAllGroupsForUser(userId)
  // console.log("SCHEDULING TASK retrievedUserGroupNames", retrievedUserGroupNames)
  var retrievedUserNames = await getAllUsersForGroups(retrievedUserGroupNames)
  // console.log("SCHEDULING TASK retrievedUserNames", retrievedUserNames)

  // get all tasks for the above users 
  // - this will be all tasks for all users in all groups for which current user is a member 
  // - also retrieves all the resources for all of these tasks
  var result = await getAllTasksForUsers(retrievedUserNames)
  var retrievedUserNames = result.retrievedUserNames
  var retrievedAllTaskNames = result.retrievedTasks
  // console.log("SCHEDULING TASK retrievedAllTaskNames", retrievedAllTaskNames)
  // console.log("SCHEDULING TASK retrievedUserNames", retrievedUserNames)

  // check for task conflicts
  var taskConflicts = checkTaskConflicts(retrievedAllTaskNames, userId)
  // console.log("SCHEDULING TASK taskConflicts", taskConflicts)

  // create array of user load
  var userLoad = await sortUserLoad(retrievedUserNames)
  // console.log("SCHEDULING TASK userLoad", userLoad)

  // resolve conflicts
  var resolved = resolveConflicts(taskConflicts, userLoad, retrievedAllTaskNames, userId)
  // console.log("RESOLVED>>>>>>>>>>>>>>>>>>>>>>", resolved)
  return resolved;
}

// define function to retrieve all groups for a user
export const getAllGroupsForUser = async (userId, plainFlag) => {
  // console.log("ENTER getAllGroupsForUser")

  try {
    // query the GroupUsers sub-collection to get group ids
    var querySnapshot = await getDocs(query(collectionGroup(db, 'GroupUsers'), where('userId', '==', userId)));
    // query the parent Group collection to get group info
    var retrievedUserGroupNames = await Promise.all(querySnapshot.docs.map(async (groupUser) => {
      const docRef = groupUser.ref;
      const parentCollectionRef = docRef.parent; // CollectionReference
      const immediateParentDocumentRef = parentCollectionRef.parent; // DocumentReference
      const parentDoc = await getDoc(immediateParentDocumentRef)

      if (plainFlag) {
        return parentDoc.id
      } else {
        return {
          "id": parentDoc.id,
          "name": parentDoc.data().name,
        }
      }
    }))

    return retrievedUserGroupNames
  } catch (error) {
    console.error(error);
  }
}

// define function to get all ther users in a list of groups
export const getAllUsersForGroups = async (retrievedUserGroupNames) => {

  // use a set to store only unique values
  var retrievedUsers = new Set();

  // get all the users in each groupid 
  for (var groupId of retrievedUserGroupNames) {
    var querySnapshot = await getDocs(query(collection(db, "Groups", groupId.id, "GroupUsers")));
    querySnapshot.forEach((doc) => {
      retrievedUsers.add(doc.data().userId)
    })
  }

  var retrievedUserNames = []
  for (var userId of retrievedUsers) {
    const userDoc = await getDoc(doc(db, "Users", userId));
    var groupsForUser = await getAllGroupsForUser(userId, true)
    var data = {
      userId: userId,
      userName: userDoc.data().name,
      groups: groupsForUser
    }

    retrievedUserNames.push(data)
  }

  return retrievedUserNames
}

// define a function to get all the tasks for a list of users
export const getAllTasksForUsers = async (retrievedUserNames) => {

  var retrievedTasks = []

  // get all the tasks for each user 
  for (var user of retrievedUserNames) {

    user.totalTasks = 0
    user.totalEffort = 0

    // query all tasks for user, ignore completed and deleted tasks
    const querySnapshot = await getDocs(query(collection(db, "Tasks"), where("assignee", "==", user.userId), where("status", "not-in", ['complete', 'deleted'])));
    querySnapshot.forEach(async (doc) => {
      retrievedTasks.push({
        "taskId": doc.id,
        "name": doc.data().name,
        "assignee": doc.data().assignee,
        "startDate": doc.data().startDate,
        "endDate": doc.data().endDate,
        "priority": doc.data().priority,
        "effort": doc.data().effort,
        "groups": [],
        "resources": []
      })

      // accumulate and store total tasks and total task effort for each user
      user.totalTasks++;
      user.totalEffort += doc.data().effort;

    })
  }

  // get the groups and resources for the retrieved tasks
  for (var task of retrievedTasks) {
    var groupForTask = await getAllGroupsForTask(task)
    var resForTask = await getAllResourcesForTask(task)
    task.groups = groupForTask
    task.resources = resForTask
  }

  return { retrievedTasks, retrievedUserNames }
}

// define a function to retrieve all the resources for a task
export const getAllResourcesForTask = async (task) => {

  var retrievedResources = [];

  try {
    // query the TaskResources sub-collection to get resourceids
    var querySnapshot = await getDocs(query(collection(db, "Tasks", task.taskId, "TaskResources")));
    // query the Resource parent documents to get resource info
    var retrievedResources = await Promise.all(querySnapshot.docs.map(async (doc) => {
      return doc.data().resourceId
    }))
  } catch (error) {
    console.error(error);
  }

  return retrievedResources;
}

export const getAllGroupsForTask = async (task) => {

  try {
    // query the TaskGroups sub-collection to get all groupids
    var querySnapshot = await getDocs(query(collection(db, "Tasks", task.taskId, "TaskGroups")));
    // query the Group parent documents to get the group info
    var retrievedResources = await Promise.all(querySnapshot.docs.map(async (doc) => {
      return doc.data().groupId
    }))
  } catch (error) {
    console.error(error);
  }

  return retrievedResources;
}

// define function to check tasks for conflicts
const checkTaskConflicts = (retrievedAllTaskNames, userId) => {

  // initialize conflicts array
  var taskConflicts = []

  // sort the All Tasks array by startDate, endDate, assignee
  var sortedTasks = retrievedAllTaskNames.sort(
    (t1, t2) =>
      (t1.startDate + t1.endDate + t1.assignee < t2.startDate + t2.endDate + t2.assignee) ? -1 :
        (t1.startDate + t1.endDate + t1.assignee > t2.startDate + t2.endDate + t2.assignee) ? 1 :
          0);
  // console.log("CHECK CONFLICTS sorted tasks", sortedTasks)

  var prevTask = {};
  prevTask.assignee = null;
  prevTask.startDate = 0;
  prevTask.endDate = 0;

  // loop through sorted tasks
  for (const task of sortedTasks) {

    // console.log("CHECK CONFLICTS checking task", task)

    // check for time conflict
    if (task.startDate < prevTask.endDate) {

      // console.log("^^^^^^^ POTENTIAL CONFLICT")

      // if the conflicting tasks are for the same user, add both to taskConflicts array
      if (task.assignee == prevTask.assignee) {
        // console.log("^^^^^^^ CONFLICT 1")
        taskConflicts.push({
          ...task,
          "conflictsWith": prevTask.taskId,
          "conflictType": "time",
          "resolved": false
        })
        taskConflicts.push({
          ...prevTask,
          "conflictsWith": task.taskId,
          "conflictType": "time",
          "resolved": false
        })
      }
      else {
        // check for resource conflict
        // check if overlapping tasks have any resources in common
        const results =
          task.resources.filter(({ resourceId: id1 }) =>
            prevTask.resources.some(({ resourceId: id2 }) => id2 === id1));

        // if the conflicting tasks have a resource in common, add both to taskConflicts array
        if (results.length > 0) {
          // console.log("^^^^^^^ CONFLICT 2")
          taskConflicts.push({
            ...task,
            "conflictsWith": prevTask.taskId,
            "conflictType": "resource",
            "resolved": false
          })
          taskConflicts.push({
            ...prevTask,
            "conflictsWith": task.taskId,
            "conflictType": "resource",
            "resolved": false
          })
        }

      }

    }
    prevTask = task

  }
  return taskConflicts
}

// define function to sort the user load by total effort
const sortUserLoad = async (retrievedUserNames) => {
  // sort the resulting userLoad by effort
  let sortedUserLoad = retrievedUserNames.sort(
    (u1, u2) =>
      (u1.totalEffort < u2.totalEffort) ? -1 :
        (u1.totalEffort > u2.totalEffort) ? 1 :
          0
  );

  return sortedUserLoad
}

// define a function to resolve the conflicting tasks
const resolveConflicts = (taskConflicts, userLoad, retrievedAllTaskNames, userId) => {

  var resolved = false;
  var checksExhausted = false;

  // loop through array of tasks that are in conflict
  for (var taskConflict of taskConflicts) {

    if (taskConflict.resolved) {
      // console.log("...RESOLVE CONFLICT skipping resolved task", taskConflict.name)
      continue
    }

    // console.log("RESOLVE CONFLICT resolving", taskConflict.name, "start", printDate(taskConflict.startDate), "end", printDate(taskConflict.endDate), "effort", taskConflict.effort)
    // console.log("...")

    resolved = false;
    checksExhausted = false;
    while (checksExhausted == false && resolved == false) {

      // check users in order from least task load
      for (var user of userLoad) {

        // console.log("USER", user)

        // if this user is not in same group as current task conflict,
        // and it's not the current user, then continue to next user
        const found = taskConflict.groups.some(element => {
          return user.groups.indexOf(element) >= 0
        })
        if (!found && user.userId != userId) {
          // console.log("...RESOLVE CONFLICT skipping user", user.userName)
          continue
        }

        if (resolved) { break }

        // console.log("...RESOLVE CONFLICT checking user:", user.userName)
        // console.log("...")

        // start 24 hours out so nothing is rescheduled within the next 24 hours
        var prevTask = {};
        prevTask.assignee = null;
        prevTask.startDate = 0;
        prevTask.endDate = Date.now() + 24 * 60 * 60000;

        // filter all tasks for this user
        const userTasks = retrievedAllTaskNames.filter(element => {
          return element.assignee === user.userId
        })
        // console.log("RESOLVE CONFLICT userTasks", userTasks)

        // get all tasks that have a resource in common this task
        const resourceTasks = filterTasks(taskConflict, retrievedAllTaskNames)
        // console.log("RESOLVE CONFLICT resourceTasks", resourceTasks)

        const allTasks = userTasks.concat(resourceTasks)
        // console.log("RESOLVE CONFLICT allTasks", allTasks)

        for (var allTask of allTasks) {

          if (resolved) { break }

          // console.log("......RESOLVE CONFLICT checking allTask:", allTask.name)

          if (allTask.taskId == taskConflict.taskId) {
            // console.log("......SKIPPING - same task")
            continue
          }

          // console.log("......allTask", allTask, printDate(allTask.endDate))
          // console.log("......prevTask", prevTask, printDate(prevTask.endDate))
          // console.log("......taskConflict", taskConflict, printDate(taskConflict.endDate))
          // console.log("......")

          if (
            // check if time between prev task end and current task latest possible start is 
            // enough for conflict task effort
            (allTask.endDate - allTask.effort * 60000) - prevTask.endDate >= taskConflict.effort * 60000
            &&
            // check if there's at least conflict task effort time between
            // prev task end and conflict task end
            taskConflict.endDate - taskConflict.effort * 60000 >= prevTask.endDate
            &&
            // check if conflict task end date is before latest possible start of current task
            (allTask.endDate - allTask.effort * 60000) >= taskConflict.endDate
          ) {

            // assign task to new user and adjust start time if required
            if (taskConflict.conflictType == "time") {
              var newAssignee = allTask.assignee
            } else {
              var newAssignee = taskConflict.assignee
            }
            var newStartDate = Math.max(prevTask.endDate, taskConflict.startDate)
            autoReassignTask(taskConflict, newAssignee, newStartDate, taskConflict.endDate)

            taskConflict.resolved = true;
            const confWith = (element) => element.taskId == taskConflict.conflictsWith;
            var conflictIdx = taskConflicts.findIndex(confWith)
            taskConflicts[conflictIdx].resolved = true;

            // adjust start time of user's following existing task if required
            // if (taskConflict.endDate > allTask.startDate) {
            //   var newAssignee = allTask.assignee
            //   var newStartDate = taskConflict.endDate
            //   autoReassignTask(allTask, newAssignee, taskConflict.endDate, allTask.endDate)
            // }

            resolved = true;
          }
          prevTask = allTask
        }

        if (!resolved) {
          // check at end of alltasks for each user if the new task fits
          // console.log("   ")
          // console.log("   ")
          // console.log("...END OF USER", user.userName)
          // console.log("...allTask", allTask, printDate(allTask.endDate))
          // console.log("...prevTask", prevTask, printDate(prevTask.endDate))
          // console.log("...taskConflict", taskConflict, printDate(taskConflict.endDate))
          // console.log("...")

          // console.log("...taskConflict.endDate - taskConflict.effort*60000 >= prevTask.endDate", taskConflict.endDate - taskConflict.effort * 60000 >= prevTask.endDate)

          if (taskConflict.endDate - taskConflict.effort * 60000 >= prevTask.endDate
          ) {
            // assign task to new user and adjust start time if required
            if (taskConflict.conflictType == "time") {
              var newAssignee = allTask.assignee
            } else {
              var newAssignee = taskConflict.assignee
            }
            var newStartDate = Math.max(prevTask.endDate, taskConflict.startDate)
            autoReassignTask(taskConflict, newAssignee, newStartDate, taskConflict.endDate)

            taskConflict.resolved = true;
            const confWith = (element) => element.taskId == taskConflict.conflictsWith;
            var conflictIdx = taskConflicts.findIndex(confWith)
            taskConflicts[conflictIdx].resolved = true;

            resolved = true;
          }
        }
      }
      checksExhausted = true;
    }
  }
  return resolved;
}

// define a function that checks tasks with resources in common
// two task object are passed in, each object has an array of resources
const filterTasks = (taskConflict, retrievedAllTaskNames) => {
  // this checks all elements of the resources array of the first task object to see if 
  // any match any of the elements of the resources array of the other task object
  const checkit3 = (el) => taskConflict.resources.some((el2) => el == el2)
  const checkit2 = (el) => el.resources.some(checkit3)
  const resourceTasks = retrievedAllTaskNames.filter(checkit2)
  return resourceTasks
}

// define function to re-assign or re-schedule the task

const autoReassignTask = async (task, assignee, startDate, endDate) => {

  // console.log("...")
  // console.log("AUTOREASSIGN", task.name, "to user:", assignee, "start:", printDate(startDate), "end:", printDate(endDate))
  // console.log("...")

  try {
    var taskDoc = await getDoc(doc(db, "Tasks", task.taskId))
    // update the userList field to contain with the new assignee
    var newUserList = [taskDoc.data().userList[0], assignee]
    // update the assignee, start date, end date and user list of the task
    var data = { ...taskDoc.data(), "assignee": assignee, "startDate": startDate, "endDate": endDate, "userList": newUserList }
    await setDoc(doc(db, "Tasks", task.taskId), data)
  } catch (error) {
    console.log(error.message)
  }
}

// function just for console.log to make javascript dates pretty
// const printDate = (d) => {
//   return "(" + new Date(d).toString().slice(0, 24) + ")"
// }