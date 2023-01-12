import { StyleSheet, Platform } from 'react-native';

module.exports = StyleSheet.create({
  // most pages will have safeview and container at top level
  safeView: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? 50 : 0,
  },
  container: {
    alignItems: 'center',
  },
  // ########################################

  // main title screen text
  titleContainer: {
    alignItems: 'center',
    paddingTop: "25%",
    paddingBottom: "25%",
    paddingLeft: "10%",
    paddingRight: "10%"
  },
  titleText: {
    fontSize: 35,
    fontWeight: "bold",
    fontFamily: Platform.OS === "android" ? "sans-serif-thin" : "AppleSDGothicNeo-Thin",
    color: "cornflowerblue",
  },
  logo: {
    width: 66,
    height: 58,
  },
  // ########################################

  // standard buttons
  mainButton: {
    width: "75%",
    height: 50,
    borderRadius: 25,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: "cornflowerblue",
    justifyContent: "center"
  },
  buttonText: {
    textAlign: "center",
    textAlignVertical: "center",
    color: "white",
    fontWeight: "bold",
    fontSize: 20
  },
  // ########################################




  // ########## input + button form
  formContainer: {
    flexDirection: 'row',
    height: 80,
    marginLeft: 10,
    marginRight: 10,
    marginTop: 15,
  },
  input: {
    height: 48,
    width: "70%",
    borderRadius: 15,
    overflow: 'hidden',
    paddingLeft: 10,
    // marginLeft: 0,
    marginRight: "2%",
    fontSize: 18,
    backgroundColor: "white"
  },
  inputButton: {
    height: 48,
    borderRadius: 5,
    width: "28%",
    alignItems: 'center',
    backgroundColor: "cornflowerblue",
    justifyContent: "center"
  },
  // ########################################

  // task list 
  taskContainer: {
    backgroundColor: "#e5e5e5",
    padding: 15,
    borderRadius: 15,
    margin: 5,
    marginHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    // paddingTop: 300,
  },
  taskDelIcon: {
    fontSize: 30,
    marginLeft: "5%",
    marginRight: "5%",
  },
  taskHeading: {
    fontWeight: "bold",
    fontSize: 18,
    marginRight: 22,
  },
  // ########################################

  // MISC
  textDisplay: {
    borderBottomWidth: 3,
    borderColor: "cornflowerblue",
    color: "cornflowerblue",
    width: "75%",
    height: 25,
    marginBottom: 5,
    paddingLeft: "5%",
    fontSize: 18,
    backgroundColor: "lightgrey"
  },
  closeBox: {
    position: 'absolute',
    bottom: "2%",
    right: "2%",
    width: "40%",
    height: 40,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: 'center',
    marginTop: 100
  },
  closeText: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },
  // ########################################

});
