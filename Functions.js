import { doc, collection, collectionGroup, query, addDoc, getDoc, getDocs, setDoc, deleteDoc, onSnapshot, where, orderBy, DocumentReference, queryEqual } from "firebase/firestore";
import { db, auth } from './firebase.config';

// complete a task
export const completeTask = async (taskObj) => {

  taskObj.status = 'complete'
  taskObj.completedDate = Math.floor(Date.now()) //serverTimestamp();

  try {
    await setDoc(doc(db, "Tasks", taskObj.id), taskObj)
  } catch (error) {
    // const errorCode = error.code;
    console.log(error.message);
    return 1;
  }

}
// delete a task
export const deleteTask = async (taskId) => {
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

    // // delete any outstanding invitations to the group
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
    await deleteDoc(doc(db, "Resources", resourceId));
  } catch (error) {
    alert(error);
  }
}

export const scheduleTasks = async (userId) => {

  console.log("***************************")
  console.log("***************************")
  console.log("*************************** SCHEDULING TASK Entered Function **************************************")
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
  var retrievedAllTaskNames = await getAllTasksForUsers(retrievedUserNames)
  // var retrievedAllTaskNames = result.retrievedTasks
  // var retrievedAllResourceNames = result.retrievedResources
  // console.log("SCHEDULING TASK retrievedAllResourceNames", retrievedAllResourceNames)

  console.log("SCHEDULING TASK retrievedAllTaskNames", retrievedAllTaskNames)



  // check for task conflicts
  // var taskConflicts = checkTaskConflicts(retrievedAllTaskNames, retrievedTaskNames, userId)
  var taskConflicts = checkTaskConflicts(retrievedAllTaskNames, userId)
  // console.log("SCHEDULING TASK taskConflicts", taskConflicts)

  // check for resource conflicts
  // var resourceConflicts = checkResourceConflicts(retrievedAllResourceNames, retrievedTaskNames, userId)
  // console.log("SCHEDULING TASK resourceConflicts", resourceConflicts)
  // taskConflicts = taskConflicts.concat(resourceConflicts)
  // console.log("SCHEDULING TASK taskConflicts", taskConflicts)

  // create array of user load
  var userLoad = calculateUserLoad(retrievedAllTaskNames)
  // console.log("SCHEDULING TASK userLoad", userLoad)

  // resolve conflicts
  var resolved = resolveConflicts(taskConflicts, userLoad, retrievedAllTaskNames)
  console.log("RESOLVED>>>>>>>>>>>>>>>>>>>>>>", resolved)













  return;
}

export const getAllGroupsForUser = async (userId) => {
  // console.log("ENTER getAllGroupsForUser")

  try {
    var querySnapshot = await getDocs(query(collectionGroup(db, 'GroupUsers'), where('userId', '==', userId)));
    // var retrievedUserGroupNames = await getGroupUsersParents(querySnapshot.docs)
    var retrievedUserGroupNames = await Promise.all(querySnapshot.docs.map(async (groupUser) => {
      const docRef = groupUser.ref;
      const parentCollectionRef = docRef.parent; // CollectionReference
      const immediateParentDocumentRef = parentCollectionRef.parent; // DocumentReference
      const parentDoc = await getDoc(immediateParentDocumentRef)

      return {
        "id": parentDoc.id,
        "name": parentDoc.data().name,
      }
    }))


    return retrievedUserGroupNames
    // return querySnapshot
  } catch (error) {
    console.error(error);
  }
}


export const getAllUsersForGroups = async (retrievedUserGroupNames, userId) => {
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
    var data = {
      id: userId,
      userName: userDoc.data().name
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

    console.log("GETTING 1 tasks for user", user.id)

    const querySnapshot = await getDocs(query(collection(db, "Tasks"), where("assignee", "==", user.id), where("status", "!=", 'complete')));
    querySnapshot.forEach(async (doc) => {


      // const retrievedGroupsForTask = await getAllGroupsForTask(doc, querySnapshot)
      // const retrievedResourcesForTask = await getAllResourcesForTask(doc, querySnapshot)

      console.log("GOT TASK", doc.id)

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

    })
  }
  // return { retrievedTasks, retrievedResources }



  // get the groups and resources for the retrieved tasks
  for (var task of retrievedTasks) {
    var groupForTask = await getAllGroupsForTask(task)
    var resForTask = await getAllResourcesForTask(task)
    task.groups = groupForTask
    task.resources = resForTask
  }



  return retrievedTasks
}

export const getAllResourcesForTask = async (task) => {
  // console.log("ENTER getAllResourcesForTask")
  // get all the resources for the task
  var retrievedResources = [];

  console.log("GETTING 2 resources for task", task.taskId)
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

  console.log("GETTING 3 groups for task", task.taskId)
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
  // console.log("CHECK CONFLICTS sorted tasks", sortedTasks)

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
        // console.log("^^^^^^^ CONFLICT 1")
        taskConflicts.push({ ...task, "conflictsWith": prevTask.taskId })
        taskConflicts.push({ ...prevTask, "conflictsWith": task.taskId })
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

        if (results) {
          // console.log("^^^^^^^ CONFLICT 2")
          taskConflicts.push({ ...task, "conflictsWith": prevTask.taskId })
          taskConflicts.push({ ...prevTask, "conflictsWith": task.taskId })
        }

      }

    }
    prevTask = task


  }
  return taskConflicts


}

const calculateUserLoad = (retrievedAllTaskNames) => {
  // console.log("ENTER calculateUserLoad")

  // sort the array by assignee
  let sortedTasks = retrievedAllTaskNames.sort(
    (t1, t2) =>
      (t1.assignee < t2.assignee) ? -1 :
        (t1.assignee > t2.assignee) ? 1 :
          0
  );

  // console.log(sortedTasks)
  // create array of count of tasks and sum of effort per assignee
  var userLoad = []
  var prevAssignee = null
  var totalTasks = 0
  var totalEffort = 0

  for (const task of sortedTasks) {

    if (prevAssignee && task.assignee != prevAssignee) {
      userLoad.push({ "userId": prevAssignee, totalTasks, totalEffort })
      totalTasks = 0
      totalEffort = 0

    }

    totalTasks++
    totalEffort += task.effort

    prevAssignee = task.assignee
  }
  userLoad.push({ "userId": prevAssignee, totalTasks, totalEffort })

  // sort the resulting userLoad by load

  // console.log(userLoad)
  let sortedUserLoad = userLoad.sort(
    (u1, u2) =>
      (u1.totalEffort < u2.totalEffort) ? -1 :
        (u1.totalEffort > u2.totalEffort) ? 1 :
          0
  );
  return sortedUserLoad
}

const resolveConflicts = (taskConflicts, userLoad, retrievedAllTaskNames) => {
  // console.log("ENTER resolveConflicts")

  var resolved = false;

  // for each task to resolve a conflict
  for (var taskConflict of taskConflicts) {
    // for (var [index, taskConflict] of taskConflicts.entries()) {

    console.log("RESOLVE CONFLICT resolving", taskConflict.name, "start", printDate(taskConflict.startDate), "end", printDate(taskConflict.endDate), "effort", taskConflict.effort)

    var checksExhausted = false;
    while (checksExhausted == false) {

      // check users in order from least task load

      for (var user of userLoad) {

        if (resolved) { break }

        console.log("RESOLVE CONFLICT checking user", user.userId)
        // skip user load for current task assignee
        // if (user.userId == taskConflict.assignee) { continue }

        // var prevStartDate = 0;
        var prevEndDate = Date.now() + 24 * 60 * 60 * 1000;

        // get all tasks for this user
        const userTasks = retrievedAllTaskNames.filter(element => {
          return element.assignee === user.userId
        })
        // console.log("RESOLVE CONFLICT userTasks", userTasks)

        // get all tasks that have a resource in common this task
        // const checkit3 = (el) => taskConflict.resources.some((el2) => el == el2)
        // const checkit2 = (el) => el.resources.some(checkit3)
        // const resourceTasks = retrievedAllTaskNames.filter(checkit2)
        const resourceTasks = filterTasks(taskConflict, retrievedAllTaskNames)
        // console.log("RESOLVE CONFLICT resourceTasks", resourceTasks)

        for (var allTask of userTasks) {

          if (resolved) { break }

          console.log("...")
          console.log("...")
          console.log("...")
          console.log("RESOLVE CONFLICT checking", allTask.name)
          console.log("allTask.assignee", allTask.assignee)
          console.log("allTask.startDate", printDate(allTask.startDate))
          console.log("allTask.endDate", printDate(allTask.endDate))
          console.log("prevEndDate", printDate(prevEndDate))
          console.log("taskConflict.assignee", taskConflict.assignee)
          console.log("taskConflict.startDate", printDate(taskConflict.startDate))
          console.log("taskConflict.endDate", printDate(taskConflict.endDate))
          console.log("taskConflict.effort", taskConflict.effort)
          console.log("taskConflict.selfAssign", taskConflict.selfAssign)
          console.log("...")

          console.log("allTask.startDate - prevEndDate >= taskConflict.effort * 60 * 1000", allTask.startDate - prevEndDate >= taskConflict.effort * 60 * 1000)
          console.log("taskConflict.endDate - taskConflict.effort * 60 * 1000 >= prevEndDate", taskConflict.endDate - taskConflict.effort * 60 * 1000 >= prevEndDate)
          console.log("taskConflict.startDate + taskConflict.effort * 60 * 1000 <= allTask.startDate", taskConflict.startDate + taskConflict.effort * 60 * 1000 <= allTask.startDate)
          // console.log("(taskConflict.selfAssign == false || taskConflict.assignee == allTask.assignee)", (taskConflict.selfAssign == false || taskConflict.assignee == allTask.assignee))

          if (allTask.taskId == taskConflict.taskId) {
            continue
          }

          if (
            allTask.startDate - prevEndDate >= taskConflict.effort * 60 * 1000
            &&
            taskConflict.endDate - taskConflict.effort * 60 * 1000 >= prevEndDate
            &&
            taskConflict.startDate + taskConflict.effort * 60 * 1000 <= allTask.startDate
            // &&
            // (taskConflict.selfAssign == false || taskConflict.assignee == allTask.assignee)
          ) {
            // TODO : add logic to check availability of all taskConflict's resources here

            // console.log("RESOLUTION set 1", taskConflict.name, "to user:", allTask.assignee, "start:", printDate(prevEndDate), "end:", printDate(prevEndDate + (taskConflict.endDate - taskConflict.startDate)))
            // console.log(taskConflict)
            autoReassignTask(taskConflict.taskId, allTask.assignee, prevEndDate, prevEndDate + (taskConflict.endDate - taskConflict.startDate))
            // remove resolved task from conflicts array
            // taskConflicts.splice(index)
            resolved = true;
            checksExhausted = true;
          }
          prevEndDate = allTask.endDate;
        }
        // check at end of alltasks for each user if the new task fits
        console.log("...")
        console.log("END OF USER", user.userId)
        console.log("allTask.assignee", allTask.assignee)
        console.log("allTask.startDate", printDate(allTask.startDate))
        console.log("allTask.endDate", printDate(allTask.endDate))
        console.log("prevEndDate", printDate(prevEndDate))
        console.log("taskConflict.assignee", taskConflict.assignee)
        console.log("taskConflict.startDate", printDate(taskConflict.startDate))
        console.log("taskConflict.endDate", printDate(taskConflict.endDate))
        console.log("taskConflict.effort", taskConflict.effort)
        console.log("taskConflict.selfAssign", taskConflict.selfAssign)
        console.log("...")
        console.log("prevEndDate + taskConflict.effort * 60 * 1000 <= taskConflict.endDate", prevEndDate + taskConflict.effort * 60 * 1000 <= taskConflict.endDate)
        // console.log("(taskConflict.selfAssign == false || taskConflict.assignee == allTask.assignee)", (taskConflict.selfAssign == false || taskConflict.assignee == allTask.assignee))
        console.log("...")

        if ((allTask.taskId != taskConflict.taskId)
          &&
          prevEndDate + taskConflict.effort * 60 * 1000 <= taskConflict.endDate
          // &&
          // (taskConflict.selfAssign == false || taskConflict.assignee == allTask.assignee)
          ) {
          // TODO : add logic to check availability of all taskConflict's resources here

          var newStartDate = Math.max(prevEndDate, taskConflict.startDate)
          // console.log("RESOLUTION set 2", taskConflict.name, "to user:", allTask.assignee, "start:", printDate(newStartDate), "end:", printDate(newStartDate + (taskConflict.endDate - taskConflict.startDate)))
          // console.log(taskConflict)
          autoReassignTask(taskConflict.taskId, allTask.assignee, newStartDate, newStartDate + (taskConflict.endDate - taskConflict.startDate))
          // remove resolved task from conflicts array
          // taskConflicts.splice(index)
          resolved = true;
          checksExhausted = true;
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


const autoReassignTask = async (taskId, assignee, startDate, endDate) => {
  // console.log("ENTER autoReassignTask")

  try {
    var taskDoc = await getDoc(doc(db, "Tasks", taskId))

    var data = { ...taskDoc.data(), "assignee": assignee, "startDate": startDate, "endDate": endDate }
    await setDoc(doc(db, "Tasks", taskId), data)

  } catch (error) {
    console.log(error.message)
  }
}


const printDate = (d) => {
  return "(" + new Date(d).toString().slice(0, 24) + ")"
}