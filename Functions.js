import {Alert} from 'react-native';
import { doc, collection, collectionGroup, query, addDoc, getDoc, getDocs, setDoc, deleteDoc, onSnapshot, where, orderBy, DocumentReference, queryEqual } from "firebase/firestore";
import { db, auth } from './firebase.config';

// complete a task
export const completeTask = async (taskObj) => {

  taskObj.status = 'complete'
  taskObj.completedDate = Math.floor(Date.now()) //serverTimestamp();

  try {
    await setDoc(doc(db, "Tasks", taskObj.id), taskObj)
  } catch (error) {
    console.log(error.message);
  }

}

// un-complete a task
export const unCompleteTask = async (taskObj) => {

  taskObj.status = 'active'
  taskObj.completedDate = 0;

  try {
    await setDoc(doc(db, "Tasks", taskObj.id), taskObj)
  } catch (error) {
    console.log(error.message);
  }

}

// mark the task as deleted
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
  taskObj.deletedDate = Math.floor(Date.now()) //serverTimestamp();

  try {
    await setDoc(doc(db, "Tasks", taskObj.id), taskObj)
  } catch (error) {
    console.log(error.message);
  }

}

// un-delete a task
export const unDeleteTask = async (taskObj) => {

  console.log("unDeleteTask triggered")
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

// permanently delete a task
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

// delete a group
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


// delete a resource
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

export const scheduleTasks = async (userId) => {

  console.log("***************************")
  console.log("***************************")
  console.log("*************************** SCHEDULING TASK Entered Function *********************************************************************")
  console.log("***************************")
  console.log("***************************")
  console.log("")
  console.log("")

  // get all users in all groups for which current user is a member
  var retrievedUserGroupNames = await getAllGroupsForUser(userId)
  // console.log("SCHEDULING TASK retrievedUserGroupNames", retrievedUserGroupNames)
  var retrievedUserNames = await getAllUsersForGroups(retrievedUserGroupNames)
  // console.log("SCHEDULING TASK retrievedUserNames", retrievedUserNames)

  // get all tasks for the above groups 
  // - this will be all tasks for all users for which current user is a member  
  //   where the task is also assigned to one of the groups 
  // - also retrieves all the resources for all of these tasks
  // var result = await getAllTasksForGroups(retrievedUserGroupNames)
  // var retrievedTaskNames = result.retrievedTasks
  // var retrievedResourceNames = result.retrievedResources
  // console.log("SCHEDULING TASK retrievedTaskNames", retrievedTaskNames)
  // console.log("SCHEDULING TASK retrievedResourceNames", retrievedResourceNames)

  // get all tasks for the above users 
  // - this will be all tasks for all users in all groups for which current user is a member 
  // - also retrieves all the resources for all of these tasks
  var result = await getAllTasksForUsers(retrievedUserNames)
  var retrievedUserNames = result.retrievedUserNames
  var retrievedAllTaskNames = result.retrievedTasks
  console.log("SCHEDULING TASK retrievedAllTaskNames", retrievedAllTaskNames)
  console.log("SCHEDULING TASK retrievedUserNames", retrievedUserNames)




  // check for task conflicts
  // var taskConflicts = checkTaskConflicts(retrievedAllTaskNames, retrievedTaskNames, userId)
  var taskConflicts = checkTaskConflicts(retrievedAllTaskNames, userId)
  console.log("SCHEDULING TASK taskConflicts", taskConflicts)

  // check for resource conflicts
  // var resourceConflicts = checkResourceConflicts(retrievedAllResourceNames, retrievedTaskNames, userId)
  // console.log("SCHEDULING TASK resourceConflicts", resourceConflicts)
  // taskConflicts = taskConflicts.concat(resourceConflicts)
  // console.log("SCHEDULING TASK taskConflicts", taskConflicts)

  // create array of user load
  // var userLoad = await calculateUserLoad(retrievedAllTaskNames)
  var userLoad = await sortUserLoad(retrievedUserNames)
  console.log("SCHEDULING TASK userLoad", userLoad)

  // resolve conflicts
  var resolved = resolveConflicts(taskConflicts, userLoad, retrievedAllTaskNames, userId)
  console.log("RESOLVED>>>>>>>>>>>>>>>>>>>>>>", resolved)













  return resolved;
}

export const getAllGroupsForUser = async (userId, plainFlag) => {
  // console.log("ENTER getAllGroupsForUser")

  try {
    var querySnapshot = await getDocs(query(collectionGroup(db, 'GroupUsers'), where('userId', '==', userId)));
    // var retrievedUserGroupNames = await getGroupUsersParents(querySnapshot.docs)
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
    // return querySnapshot
  } catch (error) {
    console.error(error);
  }
}


export const getAllUsersForGroups = async (retrievedUserGroupNames) => {
  // console.log("ENTER getAllUsersForGroups")

  // use a set to store only unique values
  var retrievedUsers = new Set();

  // get all the users in each groupid 
  for (var groupId of retrievedUserGroupNames) {
    var querySnapshot = await getDocs(query(collection(db, "Groups", groupId.id, "GroupUsers")));
    querySnapshot.forEach((doc) => {
      retrievedUsers.add(doc.data().userId)
    })
  }
  // return retrievedUsers
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



export const getAllTasksForUsers = async (retrievedUserNames) => {
  // console.log("ENTER getAllTasksForUsers")

  var retrievedTasks = []

  // get all the tasks for each user 
  for (var user of retrievedUserNames) {

    user.totalTasks = 0
    user.totalEffort = 0

    // console.log("GETTING 1 tasks for user", user.id)

    const querySnapshot = await getDocs(query(collection(db, "Tasks"), where("assignee", "==", user.userId), where("status", "not-in", ['complete', 'deleted'])));
    querySnapshot.forEach(async (doc) => {


      // const retrievedGroupsForTask = await getAllGroupsForTask(doc, querySnapshot)
      // const retrievedResourcesForTask = await getAllResourcesForTask(doc, querySnapshot)

      // console.log("GOT TASK", doc.id)

      retrievedTasks.push({
        // "keyCheck": doc.data().assignee,
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

export const getAllResourcesForTask = async (task) => {
  // console.log("ENTER getAllResourcesForTask")
  // get all the resources for the task
  var retrievedResources = [];

  // console.log("GETTING 2 resources for task", task.taskId)
  try {
    var querySnapshot = await getDocs(query(collection(db, "Tasks", task.taskId, "TaskResources")));

    var retrievedResources = await Promise.all(querySnapshot.docs.map(async (doc) => {
      // return {
      //   "resourceId": doc.data().resourceId,
      // }
      return doc.data().resourceId
    }))
  } catch (error) {
    console.error(error);
  }

  return retrievedResources;
}

export const getAllGroupsForTask = async (task) => {
  // console.log("ENTER getAllGroupsForTask")
  // get all the resources for the task
  var retrievedGroups = [];

  // console.log("GETTING 3 groups for task", task.taskId)
  try {
    var querySnapshot = await getDocs(query(collection(db, "Tasks", task.taskId, "TaskGroups")));

    var retrievedResources = await Promise.all(querySnapshot.docs.map(async (doc) => {
      // return {
      //   "groupId": doc.data().groupId,
      // }
      return doc.data().groupId
    }))
  } catch (error) {
    console.error(error);
  }

  return retrievedResources;
}

const checkTaskConflicts = (retrievedAllTaskNames, userId) => {
  // console.log("ENTER checkTaskConflicts")

  var taskConflicts = []

  // sort the All Tasks array by startDate, endDate, assignee
  var sortedTasks = retrievedAllTaskNames.sort(
    (t1, t2) =>
      (t1.startDate + t1.endDate + t1.assignee < t2.startDate + t2.endDate + t2.assignee) ? -1 :
        (t1.startDate + t1.endDate + t1.assignee > t2.startDate + t2.endDate + t2.assignee) ? 1 :
          0);
  console.log("CHECK CONFLICTS sorted tasks", sortedTasks)

  var prevTask = {};
  prevTask.assignee = null;
  prevTask.startDate = 0;
  prevTask.endDate = 0;

  for (const task of sortedTasks) {

    // console.log("CHECK CONFLICTS checking task", task)

    if (task.startDate < prevTask.endDate) {

      // console.log("^^^^^^^ POTENTIAL CONFLICT")

      // if the conflicting tasks are for the same user, add both to taskConflicts array
      if (task.assignee == prevTask.assignee) {
        console.log("^^^^^^^ CONFLICT 1")
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
        // if the conflicting tasks share a resouce, add both to taskConflicts array
        // const found = task.resources.some(element => {
        //   return
        //   prevTask.resources.indexOf(element) >= 0
        // }
        // )

        // check if overlapping tasks have any resources in common
        const results =
          task.resources.filter(({ resourceId: id1 }) =>
            prevTask.resources.some(({ resourceId: id2 }) => id2 === id1));


        console.log("RESULTS=============>", results)

        if (results.length > 0) {
          console.log("^^^^^^^ CONFLICT 2")
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

// const calculateUserLoad = async (retrievedAllTaskNames) => {
//   // console.log("ENTER calculateUserLoad")

//   // sort the array by assignee
//   let sortedTasks = retrievedAllTaskNames.sort(
//     (t1, t2) =>
//       (t1.assignee < t2.assignee) ? -1 :
//         (t1.assignee > t2.assignee) ? 1 :
//           0
//   );

//   // console.log(sortedTasks)
//   // create array of count of tasks and sum of effort per assignee
//   var userLoad = []
//   var prevAssignee = null
//   var totalTasks = 0
//   var totalEffort = 0

//   for (const task of sortedTasks) {

//     if (prevAssignee && task.assignee != prevAssignee) {
//       userLoad.push({ "userId": prevAssignee, totalTasks, totalEffort })
//       totalTasks = 0
//       totalEffort = 0

//     }

//     totalTasks++
//     totalEffort += task.effort

//     prevAssignee = task.assignee
//   }
//   userLoad.push({ "userId": prevAssignee, totalTasks, totalEffort })

//   // sort the resulting userLoad by load

//   // console.log(userLoad)
//   let sortedUserLoad = userLoad.sort(
//     (u1, u2) =>
//       (u1.totalEffort < u2.totalEffort) ? -1 :
//         (u1.totalEffort > u2.totalEffort) ? 1 :
//           0
//   );

const sortUserLoad = async (retrievedUserNames) => {
  // console.log("ENTER sortUserLoad")

  // sort the resulting userLoad by load

  // console.log(userLoad)
  let sortedUserLoad = retrievedUserNames.sort(
    (u1, u2) =>
      (u1.totalEffort < u2.totalEffort) ? -1 :
        (u1.totalEffort > u2.totalEffort) ? 1 :
          0
  );

  return sortedUserLoad
}

const resolveConflicts = (taskConflicts, userLoad, retrievedAllTaskNames, userId) => {
  // console.log("ENTER resolveConflicts")

  var resolved = false;
  var checksExhausted = false;


  // loop through array of tasks that are in conflict
  for (var taskConflict of taskConflicts) {

    if (taskConflict.resolved) {
      console.log("...RESOLVE CONFLICT skipping resolved task", taskConflict.name)
      continue
    }

    console.log("RESOLVE CONFLICT resolving", taskConflict.name, "start", printDate(taskConflict.startDate), "end", printDate(taskConflict.endDate), "effort", taskConflict.effort)
    console.log("...")

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
          // if (!found) {
          console.log("...RESOLVE CONFLICT skipping user", user.userName)
          continue
        }

        if (resolved) { break }

        console.log("...RESOLVE CONFLICT checking user:", user.userName)
        console.log("...")
        // skip user load for current task assignee
        // if (user.userId == taskConflict.assignee) { continue }

        // start 24 hours out so nothing is rescheduled within
        // the next 24 hours
        var prevTask = {};
        prevTask.assignee = null;
        prevTask.startDate = 0;
        prevTask.endDate = Date.now() + 24 * 60 * 60000;
        // var prevEndDate = Date.now() + 24*60*60000;

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


          console.log("......RESOLVE CONFLICT checking allTask:", allTask.name)


          if (allTask.taskId == taskConflict.taskId) {
            console.log("......SKIPPING - same task")
            continue
          }

          console.log("......allTask", allTask, printDate(allTask.endDate))
          console.log("......prevTask", prevTask, printDate(prevTask.endDate))
          console.log("......taskConflict", taskConflict, printDate(taskConflict.endDate))
          console.log("......")


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
            // // check if there's at least conflict task effort time between 
            // // conflict task start and current task start
            // taskConflict.startDate + taskConflict.effort*60000 <= allTask.startDate
            // &&
            // (taskConflict.selfAssign == false || taskConflict.assignee == allTask.assignee)
          ) {

            // assign task to new user and adjust start time if required
            if (taskConflict.conflictType == "time") {
              var newAssignee = allTask.assignee
            } else {
              var newAssignee = taskConflict.assignee
            }
            var newStartDate = Math.max(prevTask.endDate, taskConflict.startDate)
            autoReassignTask(taskConflict, newAssignee, newStartDate, taskConflict.endDate)
            // remove resolved task from conflicts array
            // taskConflicts.splice(index)

            // const array1 = [5, 12, 8, 130, 44];
            // const isLargeNumber = (element) => element > 13;
            // console.log(array1.findIndex(isLargeNumber));
            // // Expected output: 3


            taskConflict.resolved = true;
            const confWith = (element) => element.taskId == taskConflict.conflictsWith;
            var conflictIdx = taskConflicts.findIndex(confWith)
            taskConflicts[conflictIdx].resolved = true;
            console.log(taskConflicts)





            // // adjust start time of user's following existing task if required
            // if (taskConflict.endDate > allTask.startDate) {
            //   var newAssignee = allTask.assignee
            //   var newStartDate = taskConflict.endDate
            //   autoReassignTask(allTask, newAssignee, taskConflict.endDate, allTask.endDate)
            // }

            resolved = true;
          }
          prevTask = allTask
          // prevEndDate = allTask.endDate;
        }
        if (!resolved) {
          // check at end of alltasks for each user if the new task fits
          console.log("   ")
          console.log("   ")
          console.log("...END OF USER", user.userName)
          console.log("...allTask", allTask, printDate(allTask.endDate))
          console.log("...prevTask", prevTask, printDate(prevTask.endDate))
          console.log("...taskConflict", taskConflict, printDate(taskConflict.endDate))
          console.log("...")

          console.log("...taskConflict.endDate - taskConflict.effort*60000 >= prevTask.endDate", taskConflict.endDate - taskConflict.effort * 60000 >= prevTask.endDate)

          // if ((allTask.taskId != taskConflict.taskId)
          //   &&
          if (taskConflict.endDate - taskConflict.effort * 60000 >= prevTask.endDate
            // &&
            // (taskConflict.selfAssign == false || taskConflict.assignee == allTask.assignee)
          ) {
            // TODO : add logic to check availability of all taskConflict's resources here

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
            console.log(taskConflicts)

            resolved = true;
          }
        }
      }
      checksExhausted = true;
    }
  }
  return resolved;
}

const filterTasks = (taskConflict, retrievedAllTaskNames) => {
  // get all tasks that have a resource in common this task
  const checkit3 = (el) => taskConflict.resources.some((el2) => el == el2)
  const checkit2 = (el) => el.resources.some(checkit3)
  const resourceTasks = retrievedAllTaskNames.filter(checkit2)
  return resourceTasks
}


const autoReassignTask = async (task, assignee, startDate, endDate) => {

  console.log("...")
  console.log("AUTOREASSIGN", task.name, "to user:", assignee, "start:", printDate(startDate), "end:", printDate(endDate))
  console.log("...")

  try {
    var taskDoc = await getDoc(doc(db, "Tasks", task.taskId))

    var newUserList = [taskDoc.data().userList[0], assignee]
    var data = { ...taskDoc.data(), "assignee": assignee, "startDate": startDate, "endDate": endDate, "userList": newUserList }
    await setDoc(doc(db, "Tasks", task.taskId), data)

  } catch (error) {
    console.log(error.message)
  }
}


const printDate = (d) => {
  return "(" + new Date(d).toString().slice(0, 24) + ")"
}